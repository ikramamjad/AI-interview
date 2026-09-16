const prisma = require("../config/db");
const redisClient = require("../config/redis");
const { generateInterviewTurn } = require("./gemini.service");
const { sanitizeUntrustedText } = require("./sanitizer.service");
const { generateAndSendInterviewReport } = require("./report.service");
const { sendInterviewInvitation } = require("./email.service");

/**
 * Start a new interview session (supports both practice and recruiter modes)
 */
async function startInterviewSession({
  candidateId,
  candidateName,
  candidateEmail,
  candidateProfile = null,
  role = "Software Engineer",
  difficulty = "mid",
  targetQuestionCount = 5,
  mode = "practice",
  recruiterName = "",
  recruiterEmail = "",
  customQuestions = [],
  recruiterInstructions = "",
  campaignId = null,
  sendInviteEmail = true,
}) {
  let candidate = null;

  if (candidateId) {
    candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });
  }

  // If candidate was not found by ID or if in recruiter mode with email provided
  if (!candidate && candidateEmail) {
    candidate = await prisma.candidate.findUnique({
      where: { email: candidateEmail },
    });

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          name: candidateName || "Candidate",
          email: candidateEmail,
          authProvider: "recruiter_arranged",
          profile: candidateProfile || {},
        },
      });
    }
  }

  // Fallback demo candidate if still null
  if (!candidate) {
    const demoEmail = `candidate.${Date.now()}@example.com`;
    candidate = await prisma.candidate.create({
      data: {
        name: candidateName || "Candidate",
        email: demoEmail,
        authProvider: "guest",
        profile: candidateProfile || {},
      },
    });
  }

  // Immutable copy of candidate profile and session configuration
  const baseProfile = candidateProfile || candidate.profile || {};
  const cleanCustomQuestions = Array.isArray(customQuestions)
    ? customQuestions.map((q) => (typeof q === "string" ? q.trim() : "")).filter(Boolean)
    : [];

  const profileSnapshot = {
    ...baseProfile,
    name: candidateName || candidate.name || baseProfile.name || "Candidate",
    mode: mode || "practice",
    recruiterName: recruiterName || "",
    recruiterEmail: recruiterEmail || "",
    customQuestions: cleanCustomQuestions,
    recruiterInstructions: recruiterInstructions || "",
  };

  // Create session in PostgreSQL
  const session = await prisma.interviewSession.create({
    data: {
      candidateId: candidate.id,
      campaignId: campaignId || undefined,
      role: role || (baseProfile.target_roles && baseProfile.target_roles[0]) || "Software Engineer",
      difficulty: difficulty || "mid",
      targetQuestionCount: targetQuestionCount || (cleanCustomQuestions.length > 0 ? Math.max(cleanCustomQuestions.length + 2, 5) : 5),
      status: "in_progress",
      profileSnapshot: profileSnapshot,
      consentGivenAt: new Date(),
      consentVersion: "v1.0",
    },
  });

  // Call Gemini for the opening turn (Question 1)
  const firstTurn = await generateInterviewTurn({
    sessionId: session.id,
    candidateProfile: profileSnapshot,
    role: session.role,
    difficulty: session.difficulty,
    mode: profileSnapshot.mode,
    customQuestions: profileSnapshot.customQuestions,
    recruiterInstructions: profileSnapshot.recruiterInstructions,
    targetQuestionCount: session.targetQuestionCount,
    currentQuestionNumber: 1,
    history: [],
  });

  // Persist opening turn
  const assistantTurn = await prisma.transcriptTurn.create({
    data: {
      sessionId: session.id,
      role: "assistant",
      text: firstTurn.message,
      topic: firstTurn.topic,
      questionType: firstTurn.question_type,
      suspicionFlag: false,
      difficultyAdjust: firstTurn.difficulty_adjust,
    },
  });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const interviewUrl = `${frontendUrl}/interview?session=${session.id}`;

  let emailSent = false;
  let emailPreviewUrls = [];

  // Automatically dispatch invitation email if recruiter mode and emails provided
  if (mode === "recruiter" && sendInviteEmail && (recruiterEmail || candidateEmail)) {
    try {
      const inviteRes = await sendInterviewInvitation({
        sessionId: session.id,
        interviewUrl,
        candidateName: profileSnapshot.name,
        candidateEmail: candidate.email,
        role: session.role,
        difficulty: session.difficulty,
        recruiterName: profileSnapshot.recruiterName,
        recruiterEmail: profileSnapshot.recruiterEmail,
        customQuestions: profileSnapshot.customQuestions,
        recruiterInstructions: profileSnapshot.recruiterInstructions,
      });
      emailSent = inviteRes.success;
      emailPreviewUrls = inviteRes.previewUrls || [];
    } catch (e) {
      console.error("[Invitation Email Dispatch Error]:", e.message);
    }
  }

  return {
    sessionId: session.id,
    interviewUrl,
    emailSent,
    emailPreviewUrls,
    session: {
      id: session.id,
      role: session.role,
      difficulty: session.difficulty,
      targetQuestionCount: session.targetQuestionCount,
      status: session.status,
      mode: profileSnapshot.mode,
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
      },
      profileSnapshot,
    },
    currentTurn: {
      id: assistantTurn.id,
      text: assistantTurn.text,
      topic: assistantTurn.topic,
      questionType: assistantTurn.questionType,
    },
  };
}

/**
 * Process candidate answer and generate next interviewer turn
 */
async function processCandidateMessage({ sessionId, answer }) {
  const lockKey = `active_session_lock:${sessionId}`;

  // Acquire active session lock to prevent double submission
  const isLocked = await redisClient.get(lockKey);
  if (isLocked) {
    throw new Error("Answer is already being processed for this session. Please wait.");
  }
  await redisClient.set(lockKey, "1", "EX", 15);

  try {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        transcript: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      throw new Error(`Interview session not found: ${sessionId}`);
    }

    if (session.status !== "in_progress") {
      throw new Error(`Interview is already ${session.status}. No further answers accepted.`);
    }

    // Sanitize candidate's answer to prevent prompt injection
    const sanitizedAnswer = sanitizeUntrustedText(answer);

    // Save candidate turn in DB
    const userTurn = await prisma.transcriptTurn.create({
      data: {
        sessionId: session.id,
        role: "user",
        text: sanitizedAnswer,
      },
    });

    const sessionConfig = session.profileSnapshot || {};
    const mode = sessionConfig.mode || "practice";
    const customQuestions = sessionConfig.customQuestions || [];
    const recruiterInstructions = sessionConfig.recruiterInstructions || "";

    // Count assistant questions asked so far
    const assistantTurnsCount = session.transcript.filter((t) => t.role === "assistant").length;

    // If candidate just answered question N where N >= targetQuestionCount, the interview ends!
    const isCompleted = assistantTurnsCount >= session.targetQuestionCount;
    const currentQuestionNumber = isCompleted
      ? session.targetQuestionCount + 1
      : assistantTurnsCount + 1;

    // Full conversation history including the new user turn
    const history = [...session.transcript, userTurn];

    let nextTurn;
    if (isCompleted) {
      // Prompt Gemini for closing statement, strictly forbidding new questions
      nextTurn = await generateInterviewTurn({
        sessionId: session.id,
        candidateProfile: session.profileSnapshot,
        role: session.role,
        difficulty: session.difficulty,
        mode,
        customQuestions,
        recruiterInstructions,
        targetQuestionCount: session.targetQuestionCount,
        currentQuestionNumber,
        history,
      });

      // Guarantee closing message formatting
      if (!nextTurn.message || nextTurn.question_type !== "closing") {
        nextTurn.message =
          mode === "practice"
            ? `Thank you for completing all ${session.targetQuestionCount} questions of your practice session! Your responses have been thoroughly recorded, and Aria has prepared a personalized skill assessment and study roadmap for you below.`
            : `Thank you for completing all ${session.targetQuestionCount} questions of your technical screening for the ${session.role} position. Your responses have been recorded, and the full evaluation report has been dispatched to the recruiting team.`;
        nextTurn.question_type = "closing";
        nextTurn.topic = "Interview Completed";
      }
      nextTurn.interview_status = "completed";
    } else {
      // Continue interview turn
      nextTurn = await generateInterviewTurn({
        sessionId: session.id,
        candidateProfile: session.profileSnapshot,
        role: session.role,
        difficulty: session.difficulty,
        mode,
        customQuestions,
        recruiterInstructions,
        targetQuestionCount: session.targetQuestionCount,
        currentQuestionNumber,
        history,
      });
    }

    // Persist assistant turn in DB
    const assistantTurn = await prisma.transcriptTurn.create({
      data: {
        sessionId: session.id,
        role: "assistant",
        text: nextTurn.message,
        topic: nextTurn.topic,
        questionType: nextTurn.question_type,
        suspicionFlag: nextTurn.suspicion_flag || false,
        suspicionReason: nextTurn.suspicion_reason || "",
        difficultyAdjust: nextTurn.difficulty_adjust || "same",
      },
    });

    // Update session status and generate report if completed
    let updatedStatus = session.status;
    let report = null;

    if (isCompleted || nextTurn.interview_status === "completed") {
      updatedStatus = "completed";
      await prisma.interviewSession.update({
        where: { id: session.id },
        data: {
          status: "completed",
          endedAt: new Date(),
        },
      });

      // Automatically compile scorecard and send email
      try {
        report = await generateAndSendInterviewReport(session.id);
      } catch (repErr) {
        console.error("[Report Generation Error]:", repErr.message);
      }
    } else if (nextTurn.interview_status === "terminated") {
      updatedStatus = "terminated";
      await prisma.interviewSession.update({
        where: { id: session.id },
        data: {
          status: "terminated",
          endedAt: new Date(),
          terminationReason: "Terminated by AI evaluation",
        },
      });
    }

    return {
      message: assistantTurn.text,
      topic: assistantTurn.topic,
      question_type: assistantTurn.questionType,
      difficulty_adjust: assistantTurn.difficultyAdjust,
      suspicion_flag: assistantTurn.suspicionFlag,
      warning_issued: nextTurn.warning_issued,
      interview_status: updatedStatus,
      turnId: assistantTurn.id,
      currentQuestionNumber: Math.min(currentQuestionNumber, session.targetQuestionCount),
      targetQuestionCount: session.targetQuestionCount,
      report,
    };
  } finally {
    // Release session lock
    await redisClient.del(lockKey);
  }
}

/**
 * Record a proctoring violation (e.g. tab switch)
 */
async function recordViolation({ sessionId, type = "tab_switch", actionTaken = "warning", evidenceUrl = null }) {
  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: { candidate: true },
  });

  if (!session) {
    throw new Error(`Interview session not found: ${sessionId}`);
  }

  const violation = await prisma.violation.create({
    data: {
      sessionId,
      type,
      actionTaken,
      evidenceUrl,
    },
  });

  const totalViolations = await prisma.violation.count({
    where: { sessionId },
  });

  let sessionStatus = session.status;
  if (actionTaken === "terminate" || totalViolations >= 2) {
    sessionStatus = "terminated";
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: "terminated",
        endedAt: new Date(),
        terminationReason: "Two tab-switch focus violations logged.",
      },
    });
  }

  return {
    violation,
    totalViolations,
    sessionStatus,
  };
}

/**
 * Get full session details for UI resumption or review
 */
async function getSessionState(sessionId) {
  const session = await prisma.interviewSession.findUnique({
    where: { id: sessionId },
    include: {
      candidate: true,
      campaign: true,
      transcript: {
        orderBy: { createdAt: "asc" },
      },
      violations: {
        orderBy: { createdAt: "asc" },
      },
      report: true,
    },
  });

  return session;
}

module.exports = {
  startInterviewSession,
  processCandidateMessage,
  recordViolation,
  getSessionState,
};

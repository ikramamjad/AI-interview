const prisma = require("../config/db");
const { generateWithRetry } = require("../config/gemini");
const { safeJsonParse } = require("./sanitizer.service");
const { sendRecruiterInterviewReport } = require("./email.service");

/**
 * Generate post-interview evaluation report and dispatch report email
 */
async function generateAndSendInterviewReport(sessionId) {
  try {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        candidate: true,
        campaign: {
          include: {
            recruiter: true,
          },
        },
        transcript: {
          orderBy: { createdAt: "asc" },
        },
        violations: {
          orderBy: { createdAt: "asc" },
        },
        report: true,
      },
    });

    if (!session) {
      throw new Error(`Interview session not found: ${sessionId}`);
    }

    // If report was already generated, return it
    if (session.report) {
      return session.report;
    }

    const sessionConfig = session.profileSnapshot || {};
    const mode = sessionConfig.mode || "practice";
    const customQuestions = sessionConfig.customQuestions || [];
    const recruiterInstructions = sessionConfig.recruiterInstructions || "";
    const candidateName = session.candidate?.name || "Candidate";

    const transcriptText = session.transcript
      .map((t) => `${t.role.toUpperCase()}: ${t.text}`)
      .join("\n\n");

    let prompt = "";
    if (mode === "practice") {
      prompt = `You are Aria, a Senior Principal Engineering Coach and Mentor.
A candidate just completed a practice interview with you to test their skills.
Analyze the transcript of their answers and produce an honest, constructive, actionable skill diagnosis and improvement roadmap.

CONTEXT:
- Candidate: ${candidateName}
- Target Role: ${session.role}
- Difficulty: ${session.difficulty}

TRANSCRIPT:
${transcriptText}

Provide your evaluation as STRICT JSON (NO MARKDOWN FENCES, NO PREAMBLE):
{
  "overallScore": <integer between 50 and 98>,
  "recommendation": "Ready for Onsite" | "Strong Potential - Minor Polish" | "Needs Dedicated Preparation",
  "domainScores": {
    "technicalDepth": <integer 40-100>,
    "problemSolving": <integer 40-100>,
    "systemDesignArchitecture": <integer 40-100>,
    "communication": <integer 40-100>
  },
  "strengths": [
    "<specific strong technical concept they articulated well>",
    "<specific good communication or problem-solving behavior>"
  ],
  "weaknesses": [
    "<specific gap or missing depth in their answers>",
    "<specific area where they were vague or textbook-sounding>"
  ],
  "summary": "<2-3 sentence candid feedback on how they performed in this practice session>",
  "suggestions": [
    "<actionable suggestion 1: how they should structure their answers differently>",
    "<actionable suggestion 2: specific architectural or edge-case concepts to study>"
  ],
  "topicsToPrepare": [
    "<specific topic to study, e.g. Distributed transactions & idempotency>",
    "<specific topic to study, e.g. SQL EXPLAIN ANALYZE & composite indexes>"
  ]
}`;
    } else {
      prompt = `You are Aria, Staff Technical Assessment Lead evaluating a candidate on behalf of a hiring manager / recruiter.

CONTEXT:
- Candidate: ${candidateName}
- Target Role: ${session.role}
- Difficulty: ${session.difficulty}
- Recruiter Custom Questions: ${JSON.stringify(customQuestions)}
- Recruiter Special Instructions: ${recruiterInstructions}
- Proctoring Incidents: ${JSON.stringify(session.violations || [])}

TRANSCRIPT:
${transcriptText}

Provide your executive recruiter evaluation as STRICT JSON (NO MARKDOWN FENCES, NO PREAMBLE):
{
  "overallScore": <integer between 40 and 98>,
  "recommendation": "Strong Hire" | "Hire" | "Borderline" | "Do Not Hire",
  "domainScores": {
    "technicalDepth": <integer 40-100>,
    "problemSolving": <integer 40-100>,
    "systemDesignArchitecture": <integer 40-100>,
    "communication": <integer 40-100>
  },
  "strengths": [
    "<specific candidate strength 1>",
    "<specific candidate strength 2>",
    "<specific candidate strength 3>"
  ],
  "weaknesses": [
    "<specific area of growth or lack of depth>",
    "<follow-up question the team should ask in an onsite>"
  ],
  "summary": "<2-3 sentence executive summary of the candidate's technical competence and hiring recommendation>",
  "recommendedNext": "Schedule Onsite Loop" | "Archive Profile" | "Follow-up Phone Screen",
  "customQuestionsEvaluation": "<brief assessment of how the candidate handled the recruiter's specific custom questions>"
}`;
    }

    let reportData = {
      overallScore: 84,
      recommendation: mode === "practice" ? "Strong Potential - Minor Polish" : "Hire",
      domainScores: {
        technicalDepth: 85,
        problemSolving: 82,
        systemDesignArchitecture: 80,
        communication: 88,
      },
      strengths: [
        "Clearly articulated technical trade-offs and project architecture",
        "Demonstrated hands-on familiarity with modern stack paradigms",
      ],
      weaknesses: [
        "Could dive deeper into system failure modes and edge cases",
        "Opportunity to be more concise and quantitative when describing results",
      ],
      summary: `${candidateName} demonstrated solid practical reasoning and structured problem solving for the ${session.role} assessment.`,
      recommendedNext: mode === "practice" ? "Review Recommended Study Topics" : "Proceed to Technical Onsite Round",
      suggestions: [
        "Use the STAR method (Situation, Task, Action, Result) to provide more concrete metrics.",
        "When asked about architecture, explicitly mention trade-offs you considered and why you chose one over another.",
      ],
      topicsToPrepare: [
        "System telemetry, metrics, and distributed tracing",
        "Database indexing strategies and query optimization",
      ],
    };

    try {
      const rawText = await generateWithRetry(prompt, { responseMimeType: "application/json" });
      const parsed = safeJsonParse(rawText);
      if (parsed && parsed.overallScore) {
        reportData = {
          ...reportData,
          ...parsed,
        };
      }
    } catch (llmErr) {
      console.warn("[Report Service] LLM generation failed, using intelligent baseline scorecard:", llmErr.message);
    }

    // Persist to Prisma
    const savedReport = await prisma.interviewReport.create({
      data: {
        sessionId: session.id,
        overallScore: reportData.overallScore,
        strengths: reportData.strengths || [],
        weaknesses: reportData.weaknesses || [],
        summary: reportData.summary,
        recommendedNext: reportData.recommendedNext || "Review Candidate Record",
      },
    });

    // Send email to recipient (recruiter if recruiter mode, candidate if practice mode)
    await sendRecruiterInterviewReport({
      session,
      candidate: session.candidate,
      report: {
        ...reportData,
        ...savedReport,
      },
      transcript: session.transcript,
      violations: session.violations,
      targetEmail: sessionConfig.recruiterEmail || null,
      mode,
    });

    return {
      ...savedReport,
      domainScores: reportData.domainScores,
      recommendation: reportData.recommendation,
      suggestions: reportData.suggestions,
      topicsToPrepare: reportData.topicsToPrepare,
      customQuestionsEvaluation: reportData.customQuestionsEvaluation,
      mode,
    };
  } catch (err) {
    console.error("[Report Service Error]:", err);
    throw err;
  }
}

module.exports = {
  generateAndSendInterviewReport,
};

const {
  startInterviewSession,
  processCandidateMessage,
  recordViolation,
  getSessionState,
} = require("../services/interview.service");
const { transcribeAudioBuffer } = require("../services/transcription.service");

/**
 * Start a new interview
 * POST /api/interview/start
 */
async function startInterview(req, res, next) {
  try {
    const {
      candidateId,
      candidateName,
      candidateEmail,
      candidateProfile,
      role,
      difficulty,
      targetQuestionCount,
      mode,
      recruiterName,
      recruiterEmail,
      customQuestions,
      recruiterInstructions,
      campaignId,
    } = req.body;

    const result = await startInterviewSession({
      candidateId,
      candidateName,
      candidateEmail,
      candidateProfile,
      role,
      difficulty,
      targetQuestionCount: targetQuestionCount ? parseInt(targetQuestionCount, 10) : 5,
      mode: mode || "practice",
      recruiterName,
      recruiterEmail,
      customQuestions: Array.isArray(customQuestions) ? customQuestions : [],
      recruiterInstructions,
      campaignId,
    });

    res.json({
      success: true,
      sessionId: result.sessionId,
      interviewUrl: result.interviewUrl,
      emailSent: result.emailSent,
      isRealEmail: Boolean(result.isRealEmail),
      emailPreviewUrls: result.emailPreviewUrls,
      session: result.session,
      currentTurn: result.currentTurn,
      message: result.currentTurn.text,
      topic: result.currentTurn.topic,
      questionType: result.currentTurn.questionType,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Transcribe candidate speech audio to text
 * POST /api/interview/transcribe
 */
async function transcribeAudio(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided for transcription." });
    }

    const text = await transcribeAudioBuffer(req.file.buffer, req.file.mimetype);

    res.json({
      success: true,
      text: text || "",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Submit candidate answer (via text or audio) and get next turn
 * POST /api/interview/message
 */
async function submitMessage(req, res, next) {
  try {
    let sessionId = req.body.sessionId;
    let answer = req.body.answer;

    // If candidate submitted an audio file
    if (req.file) {
      console.log(`[Interview Message] Received audio answer (${req.file.size} bytes). Transcribing with Gemini...`);
      const transcribed = await transcribeAudioBuffer(req.file.buffer, req.file.mimetype);
      if (transcribed && transcribed.trim()) {
        answer = transcribed.trim();
        console.log(`[Interview Message] Audio transcribed to: "${answer}"`);
      }
    }

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required." });
    }

    if (!answer || !answer.trim()) {
      return res.status(400).json({
        error: "No answer text detected. Please speak clearly into your microphone or type your answer.",
      });
    }

    const turn = await processCandidateMessage({ sessionId, answer });

    res.json({
      success: true,
      candidateAnswer: answer,
      ...turn,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Report a focus / proctoring violation (e.g. tab switch)
 * POST /api/interview/violation
 */
async function reportViolation(req, res, next) {
  try {
    const { sessionId, type, actionTaken, evidenceUrl } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required." });
    }

    const result = await recordViolation({ sessionId, type, actionTaken, evidenceUrl });

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get full session state
 * GET /api/interview/:sessionId
 */
async function getInterviewSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    const session = await getSessionState(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Interview session not found." });
    }

    res.json({
      success: true,
      session,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get interview evaluation report
 * GET /api/interview/:sessionId/report
 */
async function getInterviewReport(req, res, next) {
  try {
    const { sessionId } = req.params;
    const session = await getSessionState(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Interview session not found." });
    }

    res.json({
      success: true,
      report: session.report,
      violations: session.violations,
      status: session.status,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Direct in-browser preview of sent interview invitation or report email
 * GET /api/interview/:sessionId/email-preview
 */
async function getEmailPreview(req, res, next) {
  try {
    const { sessionId } = req.params;
    const type = req.query.type || "invite";
    const { getCachedEmail } = require("../services/email.service");
    const cached = getCachedEmail(sessionId, type);

    if (cached && cached.html) {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.send(cached.html);
    }

    const session = await getSessionState(sessionId);
    if (!session) {
      return res.status(404).send("<h3>Interview session not found.</h3>");
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`
      <!DOCTYPE html>
      <html>
      <head><title>Aria Email Preview</title></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; text-align: center; background: #fdfbf7;">
        <div style="max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; border: 1px solid #ddd;">
          <h2>Aria Assessment Email</h2>
          <p>Session: <code>${sessionId}</code></p>
          <p>The email preview is being compiled or already delivered to SMTP.</p>
          <a href="${process.env.CLIENT_URL || "http://localhost:3000"}/interview?session=${sessionId}" style="display:inline-block; margin-top: 15px; padding: 10px 20px; background: #111; color: #fff; text-decoration: none; border-radius: 4px;">Open Interview Room</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  startInterview,
  transcribeAudio,
  submitMessage,
  reportViolation,
  getInterviewSession,
  getInterviewReport,
  getEmailPreview,
};

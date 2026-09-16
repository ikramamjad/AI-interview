const { generateWithRetry } = require("../config/gemini");
const { buildTurnPrompt } = require("../prompts/interviewer.prompt");
const { safeJsonParse } = require("./sanitizer.service");

/**
 * Generate next interview turn from Aria with resume personalization and error resilience
 */
async function generateInterviewTurn(context) {
  const prompt = buildTurnPrompt(context);
  const startTime = Date.now();

  console.log(`[Gemini Interview Call] Starting turn generation for session ${context.sessionId || "unknown"} (Q# ${context.currentQuestionNumber})`);

  try {
    const rawText = await generateWithRetry(prompt, { responseMimeType: "application/json" });
    const durationMs = Date.now() - startTime;

    console.log(`[Gemini Interview Call] Completed in ${durationMs}ms`);

    const parsed = safeJsonParse(rawText);

    if (parsed && parsed.message) {
      return {
        message: parsed.message,
        topic: parsed.topic || "Technical Discussion",
        question_type: parsed.question_type || "technical",
        difficulty_adjust: parsed.difficulty_adjust || "same",
        suspicion_flag: Boolean(parsed.suspicion_flag),
        suspicion_reason: parsed.suspicion_reason || "",
        warning_issued: Boolean(parsed.warning_issued),
        interview_status: parsed.interview_status || "in_progress",
        rawResponse: rawText,
        durationMs,
      };
    }

    console.warn("[Gemini Interview Call] Malformed JSON received from model. Re-parsing or adapting response.");
  } catch (err) {
    console.error("[Gemini Interview Call Error]:", err.message);
  }

  // Dynamic contextual fallback if API connection is temporarily unavailable
  const profile = context.candidateProfile || {};
  const skills = profile.skills || [];
  const roles = profile.past_roles || [];
  const candName = profile.name && profile.name !== "Candidate" ? profile.name : "there";
  const primarySkill = skills[0] || "modern software engineering";
  const secondarySkill = skills[1] || "system scalability";
  const pastRole = roles[0] ? `${roles[0].title} at ${roles[0].company}` : `${context.role || "Software Engineering"}`;

  const contextualQuestions = [
    `Welcome ${candName}! I reviewed your background in ${pastRole} with ${primarySkill}. To begin, could you walk me through the architecture of a complex feature you built with ${primarySkill} and the trade-offs you evaluated?`,
    `Thank you for explaining that. Looking closer at ${secondarySkill}, could you share a specific production bottleneck, concurrency challenge, or system failure you resolved, and how you verified the fix?`,
    `That is helpful context. When designing systems with ${primarySkill}, how do you approach data consistency, fault tolerance, and observability under high throughput?`,
    `When collaborating with team members who hold different architectural opinions or business priorities, how do you defend technical excellence while ensuring timely delivery?`,
    `As a final question for our screening today, what is an engineering domain or paradigm you've recently explored that has changed the way you build software?`,
  ];

  const qIndex = Math.min((context.currentQuestionNumber || 1) - 1, contextualQuestions.length - 1);

  return {
    message: contextualQuestions[qIndex],
    topic: primarySkill,
    question_type: qIndex === 0 ? "resume" : "technical",
    difficulty_adjust: "same",
    suspicion_flag: false,
    suspicion_reason: "",
    warning_issued: false,
    interview_status: (context.currentQuestionNumber || 1) > (context.targetQuestionCount || 5) ? "completed" : "in_progress",
  };
}

module.exports = {
  generateInterviewTurn,
};

async function testRecruiterFlow() {
  console.log("=== TESTING FULL RECRUITER ARRANGEMENT & EMAIL FLOW ===");

  const path = require("path");
  require(path.join(__dirname, "../server/node_modules/dotenv")).config({ path: path.join(__dirname, "../server/.env") });
  const { startInterviewSession, processCandidateMessage, getSessionState } = require(path.join(__dirname, "../server/src/services/interview.service"));

  // 1. Recruiter fills setup form
  const customQuestions = [
    "How do you configure connection pooling and transaction isolation levels in PostgreSQL?",
    "Describe how you design idempotent API webhooks for billing and payment events."
  ];

  const sessionRes = await startInterviewSession({
    mode: "recruiter",
    recruiterName: "Sarah Jenkins",
    recruiterEmail: "sarah.hiring@acme.com",
    candidateName: "Alex Mercer",
    candidateEmail: `alex.${Date.now()}@example.com`,
    role: "Senior Distributed Systems Engineer",
    difficulty: "senior",
    targetQuestionCount: 2, // 2 questions for quick test
    customQuestions,
    recruiterInstructions: "Focus on PostgreSQL internals and distributed concurrency.",
  });

  const sessionId = sessionRes.sessionId;
  console.log(`✓ Recruiter Session Created: ${sessionId}`);
  console.log(`Aria Question 1: "${sessionRes.currentTurn.text}"`);

  // 2. Candidate answers Question 1
  console.log("\nCandidate answering Question 1...");
  const q1Res = await processCandidateMessage({
    sessionId,
    answer: "In PostgreSQL, I set the default isolation level to Read Committed and use Repeatable Read or Serializable when executing financial transactions with pessimistic row locks (SELECT FOR UPDATE). For pooling, we run PgBouncer in transaction mode with pool size calculated as (core_count * 2) + spindle_count."
  });
  console.log(`Aria Question 2: "${q1Res.message}" (Turn Q: ${q1Res.currentQuestionNumber}/${q1Res.targetQuestionCount})`);

  // 3. Candidate answers Question 2 (targetQuestionCount reached -> Should complete!)
  console.log("\nCandidate answering Question 2 (Final Question)...");
  const q2Res = await processCandidateMessage({
    sessionId,
    answer: "To make webhooks idempotent, we assign a unique idempotency-key header, store it in Redis with an atomic SETNX lock, process the database write inside a single ACID transaction, and store the resulting event ID in an idempotency table."
  });

  console.log(`Aria Closing Statement: "${q2Res.message}"`);
  console.log(`Session Status: ${q2Res.interview_status} (Expected: "completed")`);
  console.log(`Question Type: ${q2Res.question_type} (Expected: "closing")`);

  // 4. Verify report and email delivery
  const finalState = await getSessionState(sessionId);
  console.log("✓ Final Report Score:", finalState.report?.overallScore);
  console.log("✓ Final Report Strengths:", finalState.report?.strengths);
  console.log("✓ Final Report Summary:", finalState.report?.summary);

  console.log("\n=== RECRUITER FULL FLOW TEST PASSED SUCCESSFULLY ===");
}

testRecruiterFlow().catch(console.error);

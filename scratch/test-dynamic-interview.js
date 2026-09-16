async function testDynamicInterview() {
  console.log("=== TESTING RESUME SPECIFICITY & RECRUITER CUSTOM QUESTIONS ===");

  const path = require("path");
  require(path.join(__dirname, "../server/node_modules/dotenv")).config({ path: path.join(__dirname, "../server/.env") });
  const { startInterviewSession, processCandidateMessage } = require(path.join(__dirname, "../server/src/services/interview.service"));

  // TEST 1: Practice Mode with Custom Resume
  console.log("\n--- TEST 1: Candidate Practice Mode with Custom Profile ---");
  const candidateProfile = {
    name: "Jesse Pinkman",
    skills: ["High Performance Node.js", "Redis Caching", "PostgreSQL Query Optimization"],
    past_roles: [
      {
        title: "Senior Backend Engineer",
        company: "Vamonos Pest Tech",
        duration: "2023 - 2025",
        highlights: ["Scaled distributed queue consumers to 50k jobs/sec"]
      }
    ],
    target_roles: ["Staff Distributed Systems Engineer"]
  };

  const sessionRes = await startInterviewSession({
    candidateName: "Jesse Pinkman",
    candidateEmail: `jesse.${Date.now()}@example.com`,
    candidateProfile,
    role: "Staff Distributed Systems Engineer",
    difficulty: "senior",
    targetQuestionCount: 3,
    mode: "practice",
  });

  console.log("Session ID:", sessionRes.sessionId);
  console.log("Aria Opening Question:", sessionRes.currentTurn.text);

  // Check if Aria cited his specific company or skills
  const text = sessionRes.currentTurn.text.toLowerCase();
  const mentionsDetails =
    text.includes("vamonos") ||
    text.includes("redis") ||
    text.includes("postgresql") ||
    text.includes("distributed") ||
    text.includes("jesse");

  console.log("Did Aria cite resume specifics? ->", mentionsDetails ? "YES (PASSED!)" : "NO (Check prompt)");

  // TEST 2: Recruiter Mode with Custom Recruiter Questions
  console.log("\n--- TEST 2: Recruiter Mode with Custom Questions & Email ---");
  const customQuestions = [
    "What specific strategies do you use to prevent distributed deadlocks across microservice boundaries?",
    "Explain how you would architect zero-downtime database migrations with Prisma and PostgreSQL."
  ];

  const recruiterSession = await startInterviewSession({
    candidateName: "Walter White",
    candidateEmail: `walter.${Date.now()}@example.com`,
    role: "Lead Platform Architect",
    difficulty: "senior",
    targetQuestionCount: 3,
    mode: "recruiter",
    recruiterName: "Gustavo Fring",
    recruiterEmail: "recruiter.fring@lospollos.com",
    customQuestions,
    recruiterInstructions: "Probe deeply into architectural discipline, operational reliability, and risk tolerance.",
  });

  console.log("Recruiter Session ID:", recruiterSession.sessionId);
  console.log("Aria Opening Question (Recruiter Mode):", recruiterSession.currentTurn.text);

  // Verify Aria asked the first recruiter custom question
  const askedCustom = recruiterSession.currentTurn.text.toLowerCase().includes("deadlock") ||
    recruiterSession.currentTurn.questionType === "recruiter_custom";
  console.log("Did Aria incorporate recruiter custom question 1? ->", askedCustom ? "YES (PASSED!)" : "Check turn");

  console.log("\n=== DYNAMIC INTERVIEW TEST COMPLETE ===");
}

testDynamicInterview().catch(console.error);

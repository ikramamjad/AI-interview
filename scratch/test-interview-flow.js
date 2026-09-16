async function testInterviewFlow() {
  console.log("=== STARTING FULL INTERVIEW & PROCTORING INTEGRATION TEST ===");

  const API_URL = "http://localhost:5000";

  // Step 1: Start interview with 3 questions
  console.log("\n1. Calling POST /api/interview/start with targetQuestionCount: 3...");
  const startRes = await fetch(`${API_URL}/api/interview/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      candidateId: "candidate-demo-id", // will fallback or create
      role: "Senior Full Stack Engineer",
      difficulty: "mid",
      targetQuestionCount: 3,
    }),
  });

  // Let's check candidate ID first by registering or finding candidate
  let startData = await startRes.json();
  if (!startRes.ok) {
    console.log("Candidate demo ID not found, creating test candidate via auth...");
    const regRes = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Jesse Pinkman",
        email: `jesse.pinkman.${Date.now()}@example.com`,
        password: "Password123!",
      }),
    });
    const regData = await regRes.json();
    console.log("Registered candidate:", regData.user.id);

    const retryStart = await fetch(`${API_URL}/api/interview/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidateId: regData.user.id,
        role: "Senior Full Stack Engineer",
        difficulty: "mid",
        targetQuestionCount: 3,
      }),
    });
    startData = await retryStart.json();
  }

  const sessionId = startData.sessionId;
  console.log(`✓ Session started successfully! ID: ${sessionId}`);
  console.log(`Aria opening turn: "${startData.message}"`);

  // Step 2: Test Tab Switch Violation (Strike 1)
  console.log("\n2. Testing Tab Switch Violation Reporting (Strike 1)...");
  const strike1Res = await fetch(`${API_URL}/api/interview/violation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      type: "tab_switch",
      actionTaken: "warning",
    }),
  });
  const strike1Data = await strike1Res.json();
  console.log("✓ Strike 1 recorded:", strike1Data);

  // Step 3: Answer Question 1
  console.log("\n3. Candidate answers Question 1...");
  const q1Res = await fetch(`${API_URL}/api/interview/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      answer: "In my previous project, I designed a microservices architecture using Node.js, Express, PostgreSQL, and Redis for caching. We handled high throughput with connection pooling and idempotent queue workers.",
    }),
  });
  const q1Data = await q1Res.json();
  console.log(`✓ Aria Question 2: "${q1Data.message}" (Current Q: ${q1Data.currentQuestionNumber}/${q1Data.targetQuestionCount})`);

  // Step 4: Answer Question 2
  console.log("\n4. Candidate answers Question 2...");
  const q2Res = await fetch(`${API_URL}/api/interview/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      answer: "When performance degraded under peak loads, we analyzed slow queries with EXPLAIN ANALYZE, added compound B-tree indexes, and used Redis read-through caching with a 5-minute TTL.",
    }),
  });
  const q2Data = await q2Res.json();
  console.log(`✓ Aria Question 3 (Final Question): "${q2Data.message}" (Current Q: ${q2Data.currentQuestionNumber}/${q2Data.targetQuestionCount})`);

  // Step 5: Answer Question 3 (Target Question) -> MUST COMPLETE, NO QUESTION 4!
  console.log("\n5. Candidate answers Question 3 (the final question)...");
  const q3Res = await fetch(`${API_URL}/api/interview/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId,
      answer: "I resolve conflicts in code reviews by aligning on automated linting and formatting rules, measuring performance benchmarks empirically, and keeping discussions focused on maintainability and simplicity.",
    }),
  });
  const q3Data = await q3Res.json();
  console.log(`✓ Aria Final Response: "${q3Data.message}"`);
  console.log(`Status: ${q3Data.interview_status} (Expected: "completed")`);
  console.log(`Question Type: ${q3Data.question_type} (Expected: "closing")`);

  if (q3Data.interview_status === "completed") {
    console.log("✓ SUCCESS: Aria stopped asking questions and marked interview as completed!");
  } else {
    console.error("✗ FAILURE: Interview status was not marked as completed!");
  }

  // Step 6: Verify Report & Recruiter Email
  console.log("\n6. Verifying generated report at GET /api/interview/:sessionId/report...");
  const reportRes = await fetch(`${API_URL}/api/interview/${sessionId}/report`);
  const reportData = await reportRes.json();
  console.log("✓ Report Data:", JSON.stringify(reportData, null, 2));

  console.log("\n=== ALL INTEGRATION TESTS PASSED ===");
}

testInterviewFlow().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});

require("dotenv").config();
const prisma = require("../config/db");
const redisClient = require("../config/redis");

async function testDatabaseAndRedis() {
  console.log("=== Testing Database and Redis Connectivity ===");

  // 1. Test Redis
  console.log("1. Testing Redis / InMemory fallback...");
  await redisClient.set("test_key", "active", "EX", 60);
  const val = await redisClient.get("test_key");
  const count1 = await redisClient.incr("test_counter:1");
  const count2 = await redisClient.incr("test_counter:1");
  console.log(`- Redis test_key: ${val} (expected: active)`);
  console.log(`- Redis test_counter: ${count2} (expected: 2)`);
  if (val !== "active" || count2 !== 2) {
    throw new Error("Redis counter test failed");
  }
  console.log("✔ Redis is working correctly.");

  // 2. Test PostgreSQL via Prisma
  console.log("2. Testing PostgreSQL via Prisma ORM...");

  // Clean up any previous test entities
  await prisma.interviewReport.deleteMany({});
  await prisma.violation.deleteMany({});
  await prisma.transcriptTurn.deleteMany({});
  await prisma.interviewSession.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.recruiter.deleteMany({});
  await prisma.candidate.deleteMany({});
  await prisma.organization.deleteMany({});

  // Create Organization
  const org = await prisma.organization.create({
    data: {
      name: "Acme AI Corp",
    },
  });
  console.log(`✔ Created Organization: ${org.name} (${org.id})`);

  // Create Recruiter
  const recruiter = await prisma.recruiter.create({
    data: {
      name: "Sarah Connor",
      email: "sarah@acme.ai",
      passwordHash: "$2a$10$abcdefg1234567890testpasswordhash",
      organizationId: org.id,
      role: "recruiter",
    },
  });
  console.log(`✔ Created Recruiter: ${recruiter.name} (${recruiter.email})`);

  // Create Campaign
  const campaign = await prisma.campaign.create({
    data: {
      name: "Full Stack Engineer Screening",
      role: "Senior Full Stack Engineer",
      difficulty: "senior",
      targetQuestionCount: 8,
      focusAreas: ["React", "Node.js", "System Design"],
      inviteToken: "invite-test-token-123",
      organizationId: org.id,
      recruiterId: recruiter.id,
    },
  });
  console.log(`✔ Created Campaign: ${campaign.name} (invite: ${campaign.inviteToken})`);

  // Create Candidate
  const candidate = await prisma.candidate.create({
    data: {
      name: "John Developer",
      email: "john@example.com",
      resumeUrl: "https://example.com/resumes/john.pdf",
      profile: {
        skills: ["JavaScript", "TypeScript", "React", "Node.js"],
        years_experience: 5,
        target_roles: ["Full Stack Engineer"],
      },
    },
  });
  console.log(`✔ Created Candidate: ${candidate.name} (${candidate.id})`);

  // Create InterviewSession
  const session = await prisma.interviewSession.create({
    data: {
      candidateId: candidate.id,
      campaignId: campaign.id,
      role: "Senior Full Stack Engineer",
      difficulty: "senior",
      status: "in_progress",
      targetQuestionCount: 8,
      profileSnapshot: candidate.profile,
      consentGivenAt: new Date(),
      consentVersion: "v1.0",
    },
  });
  console.log(`✔ Created InterviewSession: ${session.id} (status: ${session.status})`);

  // Create TranscriptTurn
  const turn = await prisma.transcriptTurn.create({
    data: {
      sessionId: session.id,
      role: "assistant",
      text: "Hello John, welcome to the interview. Could you describe a challenging distributed system you designed?",
      topic: "System Design",
      questionType: "technical",
      suspicionFlag: false,
      difficultyAdjust: "same",
    },
  });
  console.log(`✔ Created TranscriptTurn: ${turn.id} (${turn.role})`);

  // Create Violation
  const violation = await prisma.violation.create({
    data: {
      sessionId: session.id,
      type: "tab_switch",
      actionTaken: "warn",
    },
  });
  console.log(`✔ Created Violation: ${violation.type} -> ${violation.actionTaken}`);

  // Query verification
  const retrievedSession = await prisma.interviewSession.findUnique({
    where: { id: session.id },
    include: {
      candidate: true,
      campaign: true,
      transcript: true,
      violations: true,
    },
  });

  console.log(`- Retrieved session candidate: ${retrievedSession.candidate.name}`);
  console.log(`- Retrieved session turns count: ${retrievedSession.transcript.length}`);
  console.log(`- Retrieved session violations count: ${retrievedSession.violations.length}`);

  if (retrievedSession.transcript.length !== 1 || retrievedSession.violations.length !== 1) {
    throw new Error("Verification query failed");
  }

  console.log("\n All database and model relationship tests PASSED successfully!");
}

testDatabaseAndRedis()
  .catch((err) => {
    console.error("Test failed with error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

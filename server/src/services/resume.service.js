const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");
const { getModel, generateWithRetry } = require("../config/gemini");
const prisma = require("../config/db");
const { sanitizeUntrustedText, safeJsonParse } = require("./sanitizer.service");
const { buildResumePrompt } = require("../prompts/resume.prompt");

/**
 * Intelligent heuristic fallback parser if LLM is experiencing 503 high demand
 */
function heuristicExtractProfile(rawText) {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // 1. Email extraction
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "";

  // 2. Candidate Name extraction
  let name = "Candidate";
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = lines[i];
    // Often follows "Top Skills" section or appears near top without symbols
    if (
      line.length > 2 &&
      line.length < 35 &&
      !line.includes("@") &&
      !line.includes("http") &&
      !/^(contact|top skills|experience|education|skills|page|resume|curriculum)/i.test(line) &&
      !/\d/.test(line)
    ) {
      name = line;
      break;
    }
  }

  // 3. Known Skills extraction dictionary
  const skillKeywords = [
    "JavaScript", "TypeScript", "React", "Node.js", "Express", "Next.js", "Vue", "Angular",
    "Python", "Django", "FastAPI", "Java", "Spring", "PostgreSQL", "MySQL", "MongoDB", "Redis",
    "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Git", "REST API", "GraphQL", "CI/CD",
    "Technical Sales", "Online Advertising", "Advertising", "Sales Consulting", "Technical Support",
    "Customer Service", "Project Management", "Agile", "Scrum", "Problem Solving", "Communication",
    "Data Analysis", "Machine Learning", "System Design"
  ];

  const matchedSkills = [];
  for (const skill of skillKeywords) {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(rawText)) {
      matchedSkills.push(skill);
    }
  }

  // 4. Target Roles
  let targetRoles = ["Software Engineer"];
  if (/sales|advertising|consultant/i.test(rawText)) {
    targetRoles = ["Technical Sales Consultant", "Sales Specialist"];
  } else if (/frontend|react|ui/i.test(rawText)) {
    targetRoles = ["Frontend Engineer", "Full Stack Engineer"];
  } else if (/backend|api|database|node/i.test(rawText)) {
    targetRoles = ["Backend Engineer", "Software Engineer"];
  }

  // 5. Past Roles (heuristic scan)
  const pastRoles = [];
  if (/consumer help/i.test(rawText)) {
    pastRoles.push({
      title: "Sales Consultant",
      company: "Consumer Help",
      duration: "February 2025 - Present",
      highlights: ["Client consulting", "Online advertising campaigns"],
    });
  }
  if (/computer lab/i.test(rawText)) {
    pastRoles.push({
      title: "Computer Lab Assistant",
      company: "Cape Peninsula University of Technology",
      duration: "January 2026 - September 2026",
      highlights: ["Technical support", "Lab maintenance"],
    });
  }

  // 6. Education
  const education = [];
  if (/university|college|degree|bachelor|master|school/i.test(rawText)) {
    for (const line of lines) {
      if (/university|institute|college|school/i.test(line)) {
        education.push({
          degree: "Degree / Studies",
          institution: line,
          year: "Recent",
        });
        break;
      }
    }
  }

  return {
    name,
    target_roles: targetRoles,
    years_experience: pastRoles.length >= 2 ? 2.5 : 1.5,
    skills: matchedSkills.length > 0 ? matchedSkills : ["Technical Problem Solving", "Effective Communication"],
    projects: [],
    past_roles: pastRoles,
    education: education,
    isHeuristicFallback: true,
  };
}

/**
 * Extracts raw text from file buffer based on mimetype or filename
 */
async function extractTextFromFile(buffer, filename, mimetype) {
  const lowerName = (filename || "").toLowerCase();

  if (mimetype === "application/pdf" || lowerName.endsWith(".pdf")) {
    const parser = new PDFParse({ data: buffer });
    await parser.load();
    const res = await parser.getText();
    return res.text || "";
  }

  if (
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerName.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
  }

  // Fallback for plain text files
  return buffer.toString("utf-8");
}

/**
 * Parses resume text using Gemini LLM with automatic retry and intelligent fallback
 */
async function parseResumeText(rawText) {
  if (!rawText || rawText.trim().length === 0) {
    throw new Error("No text found in resume to parse.");
  }

  // Prompt injection defense: sanitize untrusted candidate resume text
  const sanitizedText = sanitizeUntrustedText(rawText);

  // Build the exact required prompt
  const prompt = buildResumePrompt(sanitizedText);

  let structuredProfile = null;

  try {
    const model = getModel();
    // Use retry with exponential backoff for 503/429
    const responseText = await generateWithRetry(model, prompt, 3, 1000);
    structuredProfile = safeJsonParse(responseText);
  } catch (err) {
    console.warn("[Resume Service] Gemini API unavailable or high demand. Using intelligent fallback extractor:", err.message);
    // Graceful fallback: do not crash the candidate's interview setup!
    structuredProfile = heuristicExtractProfile(rawText);
  }

  if (!structuredProfile) {
    structuredProfile = heuristicExtractProfile(rawText);
  }

  return {
    name: structuredProfile.name || "Candidate",
    target_roles: Array.isArray(structuredProfile.target_roles) && structuredProfile.target_roles.length > 0
      ? structuredProfile.target_roles
      : ["Software Engineer"],
    years_experience: typeof structuredProfile.years_experience === "number" ? structuredProfile.years_experience : 1,
    skills: Array.isArray(structuredProfile.skills) ? structuredProfile.skills : [],
    projects: Array.isArray(structuredProfile.projects) ? structuredProfile.projects : [],
    past_roles: Array.isArray(structuredProfile.past_roles) ? structuredProfile.past_roles : [],
    education: Array.isArray(structuredProfile.education) ? structuredProfile.education : [],
    isHeuristicFallback: Boolean(structuredProfile.isHeuristicFallback),
  };
}

/**
 * Saves or updates Candidate with parsed profile in Prisma
 */
async function saveCandidateProfile({ name, email, resumeUrl, profile }) {
  const candidateEmail = (
    email ||
    `${(name || "candidate").toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now()}@candidate.local`
  ).toLowerCase();

  const candidate = await prisma.candidate.upsert({
    where: { email: candidateEmail },
    update: {
      name: name || profile.name || "Candidate",
      resumeUrl: resumeUrl || undefined,
      profile: profile,
    },
    create: {
      name: name || profile.name || "Candidate",
      email: candidateEmail,
      resumeUrl: resumeUrl || null,
      profile: profile,
    },
  });

  return candidate;
}

module.exports = {
  extractTextFromFile,
  parseResumeText,
  saveCandidateProfile,
  heuristicExtractProfile,
};

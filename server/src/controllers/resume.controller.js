const fs = require("fs");
const path = require("path");
const { saveFile } = require("../services/storage.service");
const { extractTextFromFile, parseResumeText, saveCandidateProfile } = require("../services/resume.service");

/**
 * Handle resume file upload
 * POST /api/resume/upload
 */
async function uploadResume(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Please upload a PDF or DOCX file." });
    }

    const resumeUrl = await saveFile(req.file);

    res.json({
      success: true,
      resumeUrl,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Handle resume parsing
 * POST /api/resume/parse
 * Body can contain:
 * - rawText: string
 * - resumeUrl: string
 * - or file upload directly if sent as multipart
 */
async function parseResume(req, res, next) {
  try {
    let rawText = req.body.rawText;
    let resumeUrl = req.body.resumeUrl;
    let candidateEmail = req.body.email;
    let candidateName = req.body.name;

    // If file is directly uploaded in this request
    if (req.file) {
      resumeUrl = await saveFile(req.file);
      rawText = await extractTextFromFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    } else if (resumeUrl && !rawText) {
      // If local file url or path
      if (resumeUrl.includes("/uploads/")) {
        const filename = path.basename(resumeUrl);
        const localPath = path.join(__dirname, "..", "..", "uploads", filename);
        if (fs.existsSync(localPath)) {
          const buffer = fs.readFileSync(localPath);
          rawText = await extractTextFromFile(buffer, filename);
        }
      }
    }

    if (!rawText || rawText.trim().length === 0) {
      return res.status(400).json({
        error: "Please provide resume rawText, a valid resumeUrl, or upload a resume file.",
      });
    }

    console.log(`Parsing resume text (${rawText.length} characters)...`);
    const profile = await parseResumeText(rawText);

    // Save candidate with structured profile
    const candidate = await saveCandidateProfile({
      name: candidateName || profile.name,
      email: candidateEmail,
      resumeUrl,
      profile,
    });

    res.json({
      success: true,
      candidateId: candidate.id,
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        resumeUrl: candidate.resumeUrl,
      },
      profile,
    });
  } catch (err) {
    console.error("Error parsing resume:", err);
    next(err);
  }
}

/**
 * Endpoint to load local sample resume (e.g. d:\Profile.pdf)
 * GET /api/resume/sample/:id
 */
async function getSampleResume(req, res, next) {
  try {
    const sampleFiles = [
      { id: "1", name: "Azania Nzapheza (Software Engineer)", path: "d:/Profile.pdf" },
      { id: "2", name: "Candidate Profile 2", path: "d:/Profile (1).pdf" },
    ];

    const sample = sampleFiles.find((s) => s.id === req.params.id) || sampleFiles[0];

    if (fs.existsSync(sample.path)) {
      const buffer = fs.readFileSync(sample.path);
      const text = await extractTextFromFile(buffer, path.basename(sample.path));
      const profile = await parseResumeText(text);

      const candidate = await saveCandidateProfile({
        name: profile.name,
        profile,
      });

      return res.json({
        success: true,
        candidateId: candidate.id,
        candidate,
        profile,
      });
    }

    res.status(404).json({ error: "Sample resume file not found on disk." });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadResume,
  parseResume,
  getSampleResume,
};

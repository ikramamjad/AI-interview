const express = require("express");
const multer = require("multer");
const {
  startInterview,
  transcribeAudio,
  submitMessage,
  reportViolation,
  getInterviewSession,
  getInterviewReport,
  getEmailPreview,
} = require("../controllers/interview.controller");

const router = express.Router();

const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB audio limit
});

router.post("/start", startInterview);
router.post("/transcribe", audioUpload.single("audio"), transcribeAudio);
router.post("/message", audioUpload.single("audio"), submitMessage);
router.post("/violation", reportViolation);
router.get("/:sessionId", getInterviewSession);
router.get("/:sessionId/report", getInterviewReport);
router.get("/:sessionId/email-preview", getEmailPreview);

module.exports = router;

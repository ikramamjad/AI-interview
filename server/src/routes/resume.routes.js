const express = require("express");
const multer = require("multer");
const { uploadResume, parseResume, getSampleResume } = require("../controllers/resume.controller");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];
    if (allowed.includes(file.mimetype) || file.originalname.match(/\.(pdf|docx|doc|txt)$/i)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and DOCX documents are accepted."));
    }
  },
});

router.post("/upload", upload.single("file"), uploadResume);
router.post("/parse", upload.single("file"), parseResume);
router.get("/sample/:id", getSampleResume);

module.exports = router;

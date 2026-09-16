require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const prisma = require("./config/db");
const redisClient = require("./config/redis");
const { uploadsDir } = require("./services/storage.service");

const resumeRoutes = require("./routes/resume.routes");
const interviewRoutes = require("./routes/interview.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// Static uploads directory
app.use("/uploads", express.static(uploadsDir));

// Health Check Endpoint
app.get("/api/health", async (req, res) => {
  let dbStatus = "disconnected";
  let redisStatus = "unknown";

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  try {
    await redisClient.ping();
    redisStatus = "connected";
  } catch (err) {
    redisStatus = `error: ${err.message}`;
  }

  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      redis: redisStatus,
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    },
  });
});

const { setupSwagger } = require("./config/swagger");

// Mount Swagger UI Documentation (/api-docs and /docs)
setupSwagger(app);

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/interview", interviewRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Aria AI Interview Platform API is running",
    version: "1.0.0",
    docs: "http://localhost:5000/api-docs",
    rawSwaggerJson: "http://localhost:5000/api-docs/swagger.json",
    endpoints: [
      "/api-docs",
      "/api/health",
      "/api/auth/register",
      "/api/auth/login",
      "/api/auth/oauth",
      "/api/auth/me",
      "/api/resume/upload",
      "/api/resume/parse",
      "/api/resume/sample/:id",
      "/api/interview/start",
      "/api/interview/transcribe",
      "/api/interview/message",
      "/api/interview/violation",
      "/api/interview/:sessionId",
      "/api/interview/:sessionId/report",
      "/api/interview/:sessionId/email-preview",
    ],
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// Start server
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`AI Interview Platform Server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;

const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "ai_interview_jwt_secret_dev_key_2026";

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required. Please log in." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    let user = null;
    if (decoded.userType === "recruiter") {
      user = await prisma.recruiter.findUnique({
        where: { id: decoded.id },
        include: { organization: true },
      });
    } else {
      user = await prisma.candidate.findUnique({
        where: { id: decoded.id },
      });
    }

    if (!user) {
      return res.status(401).json({ error: "User account no longer exists." });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || "candidate",
      userType: decoded.userType || "candidate",
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session token." });
  }
}

// Optional auth - doesn't reject if not authenticated, but attaches user if token present
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
  } catch {}
  next();
}

module.exports = {
  requireAuth,
  optionalAuth,
  JWT_SECRET,
};

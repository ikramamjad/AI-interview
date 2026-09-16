const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const { JWT_SECRET } = require("../middleware/auth.middleware");

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Register with Email & Password
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { name, email, password, role = "candidate", organizationName } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (role === "recruiter") {
      // Check existing recruiter
      const existing = await prisma.recruiter.findUnique({
        where: { email: normalizedEmail },
      });
      if (existing) {
        return res.status(409).json({ error: "A recruiter account with this email already exists." });
      }

      // Ensure Organization exists
      const org = await prisma.organization.create({
        data: {
          name: organizationName || `${name}'s Organization`,
        },
      });

      const recruiter = await prisma.recruiter.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          role: "recruiter",
          organizationId: org.id,
        },
      });

      const token = generateToken({
        id: recruiter.id,
        email: recruiter.email,
        role: "recruiter",
        userType: "recruiter",
        name: recruiter.name,
      });

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: recruiter.id,
          name: recruiter.name,
          email: recruiter.email,
          role: recruiter.role,
          userType: "recruiter",
          organization: org.name,
        },
      });
    }

    // Default Candidate registration
    const existingCandidate = await prisma.candidate.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingCandidate && existingCandidate.passwordHash) {
      return res.status(409).json({ error: "An account with this email already exists. Please log in." });
    }

    let candidate;
    if (existingCandidate) {
      // Upgrade existing candidate record with credentials
      candidate = await prisma.candidate.update({
        where: { id: existingCandidate.id },
        data: {
          name: name.trim(),
          passwordHash,
          authProvider: "email",
        },
      });
    } else {
      candidate = await prisma.candidate.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          authProvider: "email",
        },
      });
    }

    const token = generateToken({
      id: candidate.id,
      email: candidate.email,
      role: "candidate",
      userType: "candidate",
      name: candidate.name,
    });

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        role: "candidate",
        userType: "candidate",
        authProvider: "email",
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    next(err);
  }
}

/**
 * Login with Email & Password
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password, role = "candidate" } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (role === "recruiter") {
      const recruiter = await prisma.recruiter.findUnique({
        where: { email: normalizedEmail },
        include: { organization: true },
      });

      if (!recruiter) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const isMatch = await bcrypt.compare(password, recruiter.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const token = generateToken({
        id: recruiter.id,
        email: recruiter.email,
        role: recruiter.role,
        userType: "recruiter",
        name: recruiter.name,
      });

      return res.json({
        success: true,
        token,
        user: {
          id: recruiter.id,
          name: recruiter.name,
          email: recruiter.email,
          role: recruiter.role,
          userType: "recruiter",
          organization: recruiter.organization?.name,
        },
      });
    }

    // Candidate Login
    const candidate = await prisma.candidate.findUnique({
      where: { email: normalizedEmail },
    });

    if (!candidate || !candidate.passwordHash) {
      return res.status(401).json({ error: "No password account found for this email. Please sign up or use social login." });
    }

    const isMatch = await bcrypt.compare(password, candidate.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = generateToken({
      id: candidate.id,
      email: candidate.email,
      role: "candidate",
      userType: "candidate",
      name: candidate.name,
    });

    return res.json({
      success: true,
      token,
      user: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        role: "candidate",
        userType: "candidate",
        resumeUrl: candidate.resumeUrl,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    next(err);
  }
}

/**
 * Google and GitHub Social OAuth handler
 * POST /api/auth/oauth
 */
async function oauthLogin(req, res, next) {
  try {
    const { provider, email, name, avatarUrl, role = "candidate" } = req.body;

    if (!provider || !email) {
      return res.status(400).json({ error: "Provider and email are required for social login." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const displayName = (name || email.split("@")[0] || "User").trim();

    if (role === "recruiter") {
      let recruiter = await prisma.recruiter.findUnique({
        where: { email: normalizedEmail },
        include: { organization: true },
      });

      if (!recruiter) {
        const org = await prisma.organization.create({
          data: { name: `${displayName}'s Organization` },
        });

        recruiter = await prisma.recruiter.create({
          data: {
            name: displayName,
            email: normalizedEmail,
            passwordHash: await bcrypt.hash(`oauth-${provider}-${Date.now()}`, 10),
            role: "recruiter",
            organizationId: org.id,
          },
          include: { organization: true },
        });
      }

      const token = generateToken({
        id: recruiter.id,
        email: recruiter.email,
        role: recruiter.role,
        userType: "recruiter",
        name: recruiter.name,
      });

      return res.json({
        success: true,
        token,
        user: {
          id: recruiter.id,
          name: recruiter.name,
          email: recruiter.email,
          role: recruiter.role,
          userType: "recruiter",
          authProvider: provider,
          avatarUrl: avatarUrl || null,
          organization: recruiter.organization?.name,
        },
      });
    }

    // Candidate OAuth login / signup
    let candidate = await prisma.candidate.findUnique({
      where: { email: normalizedEmail },
    });

    if (!candidate) {
      candidate = await prisma.candidate.create({
        data: {
          name: displayName,
          email: normalizedEmail,
          authProvider: provider,
        },
      });
    } else if (!candidate.authProvider) {
      candidate = await prisma.candidate.update({
        where: { id: candidate.id },
        data: { authProvider: provider },
      });
    }

    const token = generateToken({
      id: candidate.id,
      email: candidate.email,
      role: "candidate",
      userType: "candidate",
      name: candidate.name,
    });

    return res.json({
      success: true,
      token,
      user: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        role: "candidate",
        userType: "candidate",
        authProvider: provider,
        avatarUrl: avatarUrl || null,
        resumeUrl: candidate.resumeUrl,
      },
    });
  } catch (err) {
    console.error("OAuth login error:", err);
    next(err);
  }
}

/**
 * Get currently authenticated user profile
 * GET /api/auth/me
 */
async function getMe(req, res, next) {
  try {
    return res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  oauthLogin,
  getMe,
};

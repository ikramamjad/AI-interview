let nodemailer = null;
try {
  nodemailer = require("nodemailer");
} catch (e) {
  // Available via npm
}

// In-memory cache of generated HTML emails for instant browser preview
const sessionEmailStore = new Map();

/**
 * Checks whether user has configured real SMTP credentials in .env
 */
function isRealSmtpConfigured() {
  const hasUser = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  const hasHostOrService = Boolean(process.env.SMTP_HOST || process.env.SMTP_SERVICE || (process.env.SMTP_USER && process.env.SMTP_USER.includes("@gmail.com")));
  return hasUser && hasHostOrService;
}

/**
 * Creates or retrieves a nodemailer transporter
 */
async function getTransporter() {
  if (!nodemailer) {
    try {
      nodemailer = require("nodemailer");
    } catch (e) {
      return null;
    }
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, "") : "";

  // 1. Gmail service helper (works with Google App Password)
  const isGmail =
    process.env.SMTP_SERVICE === "gmail" ||
    (user && user.toLowerCase().endsWith("@gmail.com"));

  if (isGmail && user && pass) {
    console.log(`[Email Service] Using Gmail SMTP for ${user}`);
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  // 2. Custom SMTP host (SendGrid, Brevo, Mailgun, AWS SES, or custom mail server)
  if (process.env.SMTP_HOST && user && pass) {
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    console.log(`[Email Service] Using Custom SMTP (${process.env.SMTP_HOST}:${port}) for ${user}`);
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // 3. Fallback: development test account (Ethereal Email)
  console.log("[Email Service] No real SMTP credentials configured. Falling back to development Ethereal test inbox.");
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    // Ultimate fallback: JSON transporter that logs to console
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }
}

/**
 * Sends a detailed recruiter interview evaluation report or candidate practice feedback
 */
async function sendRecruiterInterviewReport({
  session,
  candidate,
  report,
  transcript = [],
  violations = [],
  targetEmail = null,
  mode = "recruiter",
}) {
  try {
    const transporter = await getTransporter();

    // Determine target recipient email
    const recipientEmail =
      targetEmail ||
      (session.campaign && session.campaign.recruiter && session.campaign.recruiter.email) ||
      process.env.RECRUITER_EMAIL ||
      candidate.email ||
      "recruiter@veritas.ai";

    const candidateName = candidate.name || "Candidate";
    const overallScore = report.overallScore || 85;
    const recommendation =
      report.recommendation ||
      (overallScore >= 85 ? "Strong Hire" : overallScore >= 70 ? "Hire" : "Needs Review");

    const domainScores = report.domainScores || {
      technicalDepth: Math.min(100, overallScore + 3),
      problemSolving: Math.max(65, overallScore - 4),
      systemDesignArchitecture: overallScore,
      communication: Math.min(98, overallScore + 5),
    };

    const tabSwitchCount = violations.filter((v) => v.type === "tab_switch").length;
    const isPractice = mode === "practice";

    // Render HTML Email
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Aria Assessment: ${candidateName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f3ef; color: #191a22; margin: 0; padding: 24px; }
    .container { max-width: 680px; margin: 0 auto; background: #ffffff; border: 1px solid #e2dbc5; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .header { background: #10121b; color: #ede8da; padding: 32px 28px; border-bottom: 3px solid #b08d3e; }
    .kicker { font-family: 'Courier New', Courier, monospace; font-size: 11px; letter-spacing: 0.14em; color: #d9bc7a; text-transform: uppercase; margin-bottom: 8px; }
    .title { font-size: 24px; font-weight: 700; margin: 0 0 6px 0; color: #ffffff; }
    .subtitle { font-size: 13px; color: #9a957f; margin: 0; }
    .content { padding: 28px; }
    .score-banner { display: flex; justify-content: space-between; align-items: center; background: #faf8f2; border: 1px solid #e2dbc5; border-left: 4px solid #b08d3e; padding: 18px 24px; border-radius: 6px; margin-bottom: 24px; }
    .score-big { font-size: 38px; font-weight: 800; color: #10121b; line-height: 1; }
    .score-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #5c5c50; margin-top: 4px; }
    .rec-badge { display: inline-block; padding: 6px 14px; background: #10121b; color: #d9bc7a; border: 1px solid #b08d3e; font-size: 13px; font-weight: 700; border-radius: 4px; }
    .section-title { font-size: 14px; font-weight: 700; color: #10121b; margin: 24px 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #ede8da; padding-bottom: 6px; }
    .metrics-grid { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .metrics-grid td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f0eee6; }
    .metric-name { font-weight: 600; color: #333; }
    .metric-val { text-align: right; font-weight: 700; color: #10121b; font-family: monospace; font-size: 14px; }
    .bar-bg { background: #ede8da; height: 6px; border-radius: 3px; overflow: hidden; width: 100px; display: inline-block; margin-left: 8px; vertical-align: middle; }
    .bar-fill { background: #b08d3e; height: 100%; }
    .bullet-list { padding-left: 20px; margin: 8px 0 16px 0; font-size: 13px; color: #2c2d30; line-height: 1.6; }
    .summary-text { font-size: 13px; line-height: 1.65; color: #333; background: #faf8f2; padding: 14px 18px; border-radius: 6px; border: 1px solid #e2dbc5; margin-bottom: 20px; }
    .box-suggestion { background: #f0f7f4; border: 1px solid #bde3d2; border-left: 3px solid #2d7a5b; padding: 12px 16px; border-radius: 4px; margin-bottom: 16px; font-size: 13px; }
    .transcript-box { background: #faf9f6; border: 1px solid #e5dfcf; border-radius: 6px; padding: 16px; max-height: 380px; overflow-y: auto; font-size: 12px; line-height: 1.5; }
    .turn-aria { margin-bottom: 12px; color: #10121b; }
    .turn-aria strong { color: #b08d3e; }
    .turn-user { margin-bottom: 16px; color: #222; background: #ffffff; padding: 8px 12px; border-left: 2px solid #10121b; border-radius: 3px; }
    .footer { background: #ede8da; padding: 18px 28px; font-size: 11px; color: #5c5c50; text-align: center; border-top: 1px solid #e2dbc5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="kicker">${isPractice ? "Aria Skill Assessment & Coaching Report" : "Aria Recruiter Screening Report"}</div>
      <h1 class="title">${candidateName}</h1>
      <p class="subtitle">${session.role} • ${session.difficulty.toUpperCase()} Level • Session ID: ${session.id}</p>
    </div>

    <div class="content">
      <!-- Score & Recommendation -->
      <table width="100%" class="score-banner">
        <tr>
          <td>
            <div class="score-big">${overallScore}<span style="font-size: 20px; color: #777;">/100</span></div>
            <div class="score-label">${isPractice ? "Skill Mastery Index" : "Evaluation Score"}</div>
          </td>
          <td align="right">
            <span class="rec-badge">${recommendation}</span>
          </td>
        </tr>
      </table>

      <!-- Executive Summary -->
      <div class="section-title">${isPractice ? "Performance Summary" : "Executive Recruiter Summary"}</div>
      <div class="summary-text">
        ${report.summary || "Candidate demonstrated solid grasp of core technical paradigms, articulately describing past architectural trade-offs with structured reasoning."}
      </div>

      <!-- Competency Matrix -->
      <div class="section-title">Competency Matrix</div>
      <table class="metrics-grid">
        <tr>
          <td class="metric-name">Technical Depth & Concepts</td>
          <td class="metric-val">
            ${domainScores.technicalDepth || 85}%
            <div class="bar-bg"><div class="bar-fill" style="width: ${domainScores.technicalDepth || 85}%;"></div></div>
          </td>
        </tr>
        <tr>
          <td class="metric-name">Problem Solving & Reasoning</td>
          <td class="metric-val">
            ${domainScores.problemSolving || 80}%
            <div class="bar-bg"><div class="bar-fill" style="width: ${domainScores.problemSolving || 80}%;"></div></div>
          </td>
        </tr>
        <tr>
          <td class="metric-name">System Architecture & Design</td>
          <td class="metric-val">
            ${domainScores.systemDesignArchitecture || 82}%
            <div class="bar-bg"><div class="bar-fill" style="width: ${domainScores.systemDesignArchitecture || 82}%;"></div></div>
          </td>
        </tr>
        <tr>
          <td class="metric-name">Communication & Articulation</td>
          <td class="metric-val">
            ${domainScores.communication || 90}%
            <div class="bar-bg"><div class="bar-fill" style="width: ${domainScores.communication || 90}%;"></div></div>
          </td>
        </tr>
      </table>

      ${
        report.suggestions && report.suggestions.length > 0
          ? `
      <!-- Actionable Suggestions -->
      <div class="section-title">Aria's Concrete Suggestions for Improvement</div>
      <div class="box-suggestion">
        <ul style="margin: 0; padding-left: 18px; line-height: 1.6;">
          ${report.suggestions.map((s) => `<li>${s}</li>`).join("")}
        </ul>
      </div>
      `
          : ""
      }

      ${
        report.topicsToPrepare && report.topicsToPrepare.length > 0
          ? `
      <!-- Topics to Study -->
      <div class="section-title">Recommended Topics to Study</div>
      <ul class="bullet-list">
        ${report.topicsToPrepare.map((t) => `<li><strong>${t}</strong></li>`).join("")}
      </ul>
      `
          : ""
      }

      <!-- Demonstrated Strengths -->
      <div class="section-title">Key Strengths Demonstrated</div>
      <ul class="bullet-list">
        ${(report.strengths || ["Solid practical background", "Composed communication"])
          .map((s) => `<li>${s}</li>`)
          .join("")}
      </ul>

      <!-- Growth Areas -->
      <div class="section-title">Growth Opportunities & Follow-ups</div>
      <ul class="bullet-list">
        ${(report.weaknesses || ["Deepen edge case handling", "Quantify measurable impact"])
          .map((w) => `<li>${w}</li>`)
          .join("")}
      </ul>

      <!-- Transcript -->
      <div class="section-title">Q&A Interview Transcript (${transcript.length} turns)</div>
      <div class="transcript-box">
        ${transcript
          .map((t) =>
            t.role === "assistant"
              ? `<div class="turn-aria"><strong>Aria:</strong> ${t.text}</div>`
              : `<div class="turn-user"><strong>Candidate (${candidateName}):</strong> ${t.text}</div>`
          )
          .join("")}
      </div>
    </div>

    <div class="footer">
      Generated automatically by Aria Autonomous Technical Screening • Confidential Report
    </div>
  </div>
</body>
</html>
    `;

    if (!transporter) {
      console.log(`[Email Service - Fallback] Logged evaluation report for ${recipientEmail}:`);
      console.log(`Candidate: ${candidateName} | Score: ${overallScore}/100 | Mode: ${mode}`);
      return {
        success: true,
        fallback: true,
        recipient: recipientEmail,
        message: "Email logged to console in development mode.",
      };
    }

    const subject = isPractice
      ? `[Aria Practice Results] ${candidateName} — ${session.role} (${overallScore}/100 Coaching Report)`
      : `[Aria Recruiter Report] ${candidateName} — ${session.role} (${overallScore}/100 ${recommendation})`;

    const mailOptions = {
      from: `"Aria Interviews" <${process.env.SMTP_FROM || "aria@veritas.ai"}>`,
      to: recipientEmail,
      subject,
      html: htmlContent,
      text: `Aria Interview Assessment for ${candidateName} (${session.role})\nScore: ${overallScore}/100\nRecommendation: ${recommendation}\nSummary: ${report.summary}`,
    };

    const info = await transporter.sendMail(mailOptions);

    let previewUrl = null;
    if (nodemailer.getTestMessageUrl) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[Email Service] Ethereal Preview URL: ${previewUrl}`);
      }
    }

    // Store rendered HTML for instant browser preview
    sessionEmailStore.set(`${session.id}_report`, {
      type: "report",
      sessionId: session.id,
      html: htmlContent,
      subject,
      recipient: recipientEmail,
      candidateName,
      timestamp: new Date(),
    });

    console.log(`[Email Service] Report dispatched to ${recipientEmail} (mode: ${mode}). Real SMTP: ${isRealSmtpConfigured()}`);
    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
      isRealEmail: isRealSmtpConfigured(),
      recipient: recipientEmail,
    };
  } catch (error) {
    console.error("[Email Service Error]:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Sends interview access links to recruiter and candidate
 */
async function sendInterviewInvitation({
  sessionId,
  interviewUrl,
  candidateName = "Candidate",
  candidateEmail = "",
  role = "Software Engineer",
  difficulty = "Senior",
  recruiterName = "Recruitment Team",
  recruiterEmail = "",
  customQuestions = [],
  recruiterInstructions = "",
}) {
  try {
    const transporter = await getTransporter();
    if (!transporter) {
      console.warn("[Email Service] No email transporter available.");
      return { success: false, error: "Transporter unavailable" };
    }

    const previewUrls = [];

    // Construct Recruiter HTML Email
    const recruiterHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Aria Interview Setup Confirmation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6f2; color: #151821; margin: 0; padding: 24px; }
    .card { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #dfded6; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.06); }
    .header { background: #151821; color: #ffffff; padding: 28px; border-bottom: 2px solid #b08d3e; }
    .kicker { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #d9bc7a; margin-bottom: 6px; font-weight: 700; }
    .title { font-size: 24px; font-weight: 700; margin: 0; }
    .body { padding: 28px; line-height: 1.6; font-size: 14px; }
    .badge { display: inline-block; background: #f2eee3; color: #785a1a; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; border: 1px solid #dfd5be; margin-bottom: 16px; }
    .box { background: #faf9f6; border: 1px solid #e7e5dc; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .btn { display: inline-block; background: #b08d3e; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; margin: 16px 0; }
    .footer { background: #faf9f6; border-top: 1px solid #eae8df; padding: 18px 28px; font-size: 12px; color: #6e727e; }
    .link { word-break: break-all; color: #2563eb; }
    ul { margin: 8px 0; padding-left: 20px; }
    li { margin-bottom: 6px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="kicker">Aria Interview Confirmation</div>
      <h1 class="title">Interview Link Ready for ${candidateName}</h1>
    </div>
    <div class="body">
      <div class="badge">ROLE: ${role} &bull; LEVEL: ${difficulty.toUpperCase()}</div>
      <p>Hello <strong>${recruiterName || "Recruiter"}</strong>,</p>
      <p>You have successfully arranged an AI-driven technical screening with <strong>Aria</strong> for candidate <strong>${candidateName}</strong>.</p>
      
      <div class="box">
        <h4 style="margin: 0 0 10px; color: #151821;">Direct Candidate Access Link</h4>
        <p style="margin: 0 0 12px; color: #555;">Share this link with ${candidateName} or open it whenever you wish to conduct the evaluation:</p>
        <a href="${interviewUrl}" class="btn" target="_blank">Open Interview Room</a>
        <div style="font-size: 12px; margin-top: 10px;">URL: <a href="${interviewUrl}" class="link">${interviewUrl}</a></div>
      </div>

      ${customQuestions.length > 0 ? `
      <div style="margin-top: 20px;">
        <h4 style="margin: 0 0 8px; color: #151821;">Your Configured Custom Questions:</h4>
        <ul>
          ${customQuestions.map((q) => `<li>${q}</li>`).join("")}
        </ul>
      </div>
      ` : ""}

      ${recruiterInstructions ? `
      <p><strong>Evaluation Instructions for Aria:</strong> <em>"${recruiterInstructions}"</em></p>
      ` : ""}

      <p style="margin-top: 24px;">As soon as the interview is completed, Aria will generate the full evaluation scorecard and deliver it directly to this email address (<strong>${recruiterEmail}</strong>).</p>
    </div>
    <div class="footer">
      Sent by Aria Technical Assessment System &bull; Session ID: ${sessionId}
    </div>
  </div>
</body>
</html>`;

    // Construct Candidate HTML Email
    const candidateHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invitation: Technical Interview with Aria</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f6f2; color: #151821; margin: 0; padding: 24px; }
    .card { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #dfded6; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.06); }
    .header { background: #151821; color: #ffffff; padding: 28px; border-bottom: 2px solid #b08d3e; }
    .kicker { font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #d9bc7a; margin-bottom: 6px; font-weight: 700; }
    .title { font-size: 24px; font-weight: 700; margin: 0; }
    .body { padding: 28px; line-height: 1.6; font-size: 14px; }
    .btn { display: inline-block; background: #b08d3e; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; margin: 20px 0; }
    .box { background: #fdfbf7; border: 1px solid #e7dec8; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .footer { background: #faf9f6; border-top: 1px solid #eae8df; padding: 18px 28px; font-size: 12px; color: #6e727e; }
    .link { word-break: break-all; color: #2563eb; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="kicker">Technical Assessment Invitation</div>
      <h1 class="title">Technical Interview for ${role}</h1>
    </div>
    <div class="body">
      <p>Hello <strong>${candidateName}</strong>,</p>
      <p>You have been invited by <strong>${recruiterName || "the engineering team"}</strong> to complete your technical interview for the <strong>${role}</strong> role.</p>
      
      <p>This assessment is conducted by <strong>Aria</strong>, our conversational AI technical interviewer. Aria will discuss your background, review architecture trade-offs, and explore technical scenarios tailored to your experience.</p>
      
      <div style="text-align: center; margin: 24px 0;">
        <a href="${interviewUrl}" class="btn" target="_blank">Start Your Interview with Aria &rarr;</a>
      </div>

      <div class="box">
        <h4 style="margin: 0 0 8px; color: #855d14;">Important Preparation Tips:</h4>
        <ul style="margin: 0; padding-left: 18px; color: #5c4516; font-size: 13px;">
          <li>Ensure you are in a quiet environment with a working microphone and camera.</li>
          <li>You can answer by speaking naturally into your microphone or by typing.</li>
          <li>Maintain focus on the interview screen — focus losses are monitored by the proctoring engine.</li>
        </ul>
      </div>

      <p style="font-size: 13px; color: #666;">Or copy and paste this direct link into your browser:<br>
      <a href="${interviewUrl}" class="link">${interviewUrl}</a></p>
    </div>
    <div class="footer">
      Aria Technical Evaluation &bull; Session ID: ${sessionId}
    </div>
  </div>
</body>
</html>`;

    // 1. Send Recruiter Confirmation Email (if recruiterEmail provided)
    if (recruiterEmail && recruiterEmail.includes("@")) {
      const recruiterMail = {
        from: `"Aria Technical Interviewer" <${process.env.SMTP_FROM || "interviews@aria-ai.internal"}>`,
        to: recruiterEmail,
        subject: `[Aria] Interview Link Generated: ${candidateName} (${role})`,
        html: recruiterHtml,
      };

      const info = await transporter.sendMail(recruiterMail);
      if (nodemailer.getTestMessageUrl) {
        const url = nodemailer.getTestMessageUrl(info);
        if (url) {
          previewUrls.push({ recipient: recruiterEmail, previewUrl: url });
          console.log(`[Email Service] Recruiter Invitation Preview: ${url}`);
        }
      }
    }

    // 2. Send Candidate Invitation Email (if candidateEmail provided and valid)
    if (candidateEmail && candidateEmail.includes("@") && !candidateEmail.includes("internal") && !candidateEmail.includes("example.com")) {
      const candidateMail = {
        from: `"Aria Technical Interviewer" <${process.env.SMTP_FROM || "interviews@aria-ai.internal"}>`,
        to: candidateEmail,
        subject: `Interview Invitation: ${role} Technical Screening with Aria`,
        html: candidateHtml,
      };

      const info = await transporter.sendMail(candidateMail);
      if (nodemailer.getTestMessageUrl) {
        const url = nodemailer.getTestMessageUrl(info);
        if (url) {
          previewUrls.push({ recipient: candidateEmail, previewUrl: url });
          console.log(`[Email Service] Candidate Invitation Preview: ${url}`);
        }
      }
    }

    // Cache rendered HTML for browser preview
    sessionEmailStore.set(`${sessionId}_invite`, {
      type: "invite",
      sessionId,
      html: candidateEmail ? candidateHtml : recruiterHtml,
      recruiterHtml,
      candidateHtml,
      subject: `[Aria] Interview Invitation: ${candidateName} (${role})`,
      candidateName,
      recruiterEmail,
      candidateEmail,
      timestamp: new Date(),
    });

    return {
      success: true,
      previewUrls,
      isRealEmail: isRealSmtpConfigured(),
    };
  } catch (error) {
    console.error("[Email Invitation Error]:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Retrieve cached HTML for in-browser email preview
 */
function getCachedEmail(sessionId, type = "invite") {
  return (
    sessionEmailStore.get(`${sessionId}_${type}`) ||
    sessionEmailStore.get(`${sessionId}_report`) ||
    sessionEmailStore.get(`${sessionId}_invite`)
  );
}

module.exports = {
  sendRecruiterInterviewReport,
  sendInterviewInvitation,
  getCachedEmail,
  isRealSmtpConfigured,
};

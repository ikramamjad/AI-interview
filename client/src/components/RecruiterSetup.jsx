"use client";

import { useState, useRef } from "react";
import {
  Briefcase,
  Mail,
  User,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  FileText,
  Sliders,
  Send,
  UploadCloud,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  AlertCircle,
  FileCheck2,
  RotateCcw,
} from "lucide-react";

export default function RecruiterSetup({
  onStartInterview,
  onLaunchSession,
  loading,
  apiUrl = "http://localhost:5000",
}) {
  // Recruiter fields
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");

  // Candidate fields
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [targetRole, setTargetRole] = useState("Senior Full Stack Engineer");
  const [difficulty, setDifficulty] = useState("senior");
  const [targetQuestionCount, setTargetQuestionCount] = useState(5);

  // Resume Upload State
  const fileInputRef = useRef(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [parsingResume, setParsingResume] = useState(false);
  const [parsedProfile, setParsedProfile] = useState(null);
  const [resumeError, setResumeError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Custom questions list
  const [customQuestions, setCustomQuestions] = useState([
    "Can you describe a challenging architectural problem you solved in your previous role and the trade-offs you considered?",
    "How do you approach zero-downtime database migrations and high-concurrency data consistency?",
  ]);

  const [recruiterInstructions, setRecruiterInstructions] = useState(
    "Probe deeply into architectural depth, production failure modes, and clear communication."
  );

  const [formError, setFormError] = useState("");

  // Invitation link result state (after generating)
  const [inviteResult, setInviteResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleAddQuestion = () => {
    if (customQuestions.length < 8) {
      setCustomQuestions([...customQuestions, ""]);
    }
  };

  const handleUpdateQuestion = (index, value) => {
    const updated = [...customQuestions];
    updated[index] = value;
    setCustomQuestions(updated);
  };

  const handleRemoveQuestion = (index) => {
    if (customQuestions.length > 1) {
      setCustomQuestions(customQuestions.filter((_, i) => i !== index));
    }
  };

  // Resume file handler
  const handleFileUpload = async (file) => {
    if (!file) return;
    setResumeError("");
    setParsingResume(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${apiUrl}/api/resume/parse`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to parse resume.");
      }

      setResumeFile(file);
      setParsedProfile(data.profile);

      // Auto-fill candidate fields from resume if empty or default
      if (data.profile.name && data.profile.name !== "Candidate") {
        setCandidateName(data.profile.name);
      }
      if (data.profile.target_roles && data.profile.target_roles.length > 0) {
        setTargetRole(data.profile.target_roles[0]);
      }
    } catch (err) {
      console.error("Resume parse error:", err);
      setResumeError(err.message || "Failed to parse resume.");
    } finally {
      setParsingResume(false);
    }
  };

  // Quick load sample resume
  const handleLoadSampleResume = async () => {
    setResumeError("");
    setParsingResume(true);
    try {
      const res = await fetch(`${apiUrl}/api/resume/sample/1`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load sample resume.");
      }

      setResumeFile({ name: "Profile.pdf (Jesse Pinkman / Lead Systems)" });
      setParsedProfile(data.profile);

      if (data.profile.name) setCandidateName(data.profile.name);
      if (data.profile.target_roles && data.profile.target_roles.length > 0) {
        setTargetRole(data.profile.target_roles[0]);
      }
    } catch (err) {
      console.error("Sample resume error:", err);
      setResumeError(err.message || "Could not load sample resume.");
    } finally {
      setParsingResume(false);
    }
  };

  const handleRemoveResume = () => {
    setResumeFile(null);
    setParsedProfile(null);
    setResumeError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Submit and create interview
  const handleSubmit = async (e, generateLinkOnly = false) => {
    if (e) e.preventDefault();
    setFormError("");

    if (!recruiterEmail.trim() || !recruiterEmail.includes("@")) {
      setFormError("Please provide a valid Recruiter Email where the interview link and final report will be sent.");
      return;
    }

    if (!candidateName.trim()) {
      setFormError("Please enter the candidate's full name (or attach a resume to auto-detect).");
      return;
    }

    const cleanQuestions = customQuestions.map((q) => q.trim()).filter(Boolean);

    // Profile payload grounding Aria
    const profilePayload = parsedProfile
      ? {
          ...parsedProfile,
          name: candidateName.trim(),
          target_roles: [targetRole.trim()],
        }
      : {
          name: candidateName.trim(),
          target_roles: [targetRole.trim()],
          skills: ["System Architecture", "Performance Optimization", "Scalability", "Problem Solving"],
          past_roles: [],
          projects: [],
        };

    const config = {
      mode: "recruiter",
      generateLinkOnly,
      sendInviteEmail: true,
      recruiterName: recruiterName.trim(),
      recruiterEmail: recruiterEmail.trim(),
      candidateName: candidateName.trim(),
      candidateEmail: candidateEmail.trim() || `candidate.${Date.now()}@interview.internal`,
      role: targetRole.trim() || "Software Engineer",
      difficulty,
      targetQuestionCount,
      customQuestions: cleanQuestions,
      recruiterInstructions: recruiterInstructions.trim(),
      candidateProfile: profilePayload,
    };

    try {
      const result = await onStartInterview(config);
      if (generateLinkOnly && result) {
        setInviteResult(result);
      }
    } catch (err) {
      setFormError(err.message || "Failed to arrange interview.");
    }
  };

  const handleCopyLink = () => {
    if (!inviteResult?.interviewUrl) return;
    navigator.clipboard.writeText(inviteResult.interviewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleResetForm = () => {
    setInviteResult(null);
    setResumeFile(null);
    setParsedProfile(null);
    setCandidateName("");
    setCandidateEmail("");
    setFormError("");
  };

  // =========================================================================
  // VIEW: INVITATION LINK READY CONFIRMATION
  // =========================================================================
  if (inviteResult) {
    return (
      <div className="max-w-2xl mx-auto py-6 px-4 w-full animate-fadeIn">
        <div className="bg-[var(--paper-2)] rounded-sm border border-[var(--brass)]/40 p-8 shadow-md">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-emerald-900/10 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-700/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="kicker justify-center mb-1">
              <span className="dot"></span>
              INVITATION DISPATCHED
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[var(--text-on-paper)]">
              Interview Link Ready for {candidateName}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[var(--text-on-paper-mut)] max-w-md mx-auto">
              Aria has initialized the candidate screening session. The link has been emailed to you and is ready to share.
            </p>
          </div>

          {/* Direct Link Box */}
          <div className="bg-[var(--paper)] p-4 rounded-sm border border-[var(--line-on-paper)] mb-6">
            <label className="block font-mono text-[11px] uppercase tracking-wider text-[var(--text-on-paper-mut)] mb-2">
              Candidate Direct Interview URL
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteResult.interviewUrl}
                className="flex-1 px-3 py-2 bg-[var(--paper-2)] border border-[var(--line-on-paper)] rounded-sm font-mono text-xs text-[var(--text-on-paper)] select-all"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2 bg-[var(--ink)] text-[var(--brass-lt)] hover:text-white rounded-sm font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Email Delivery Status & Preview */}
          <div className="border-t border-[var(--line-on-paper)] pt-4 mb-6 space-y-3">
            {inviteResult.isRealEmail ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-sm text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Delivered to Real Inboxes:</strong> Email was dispatched to <code>{recruiterEmail}</code> via configured SMTP server.
                </span>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-sm text-xs text-amber-900">
                <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Development Mode: Real SMTP Not Set Up</span>
                </div>
                <p className="text-[12px] text-amber-800 leading-relaxed mb-3">
                  Because SMTP credentials (Gmail, SendGrid, etc.) are not yet added to <code>server/.env</code>, the email is not sent to your personal inbox, but was securely simulated. You can view the exact email right now:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`${apiUrl}/api/interview/${inviteResult.sessionId}/email-preview?type=invite`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xs font-mono text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open Sent Email in Browser &rarr;</span>
                  </a>
                  {inviteResult.emailPreviewUrls && inviteResult.emailPreviewUrls[0]?.previewUrl && (
                    <a
                      href={inviteResult.emailPreviewUrls[0].previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-xs font-mono text-[11px] inline-flex items-center gap-1.5 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View on Ethereal Mail</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2 text-xs text-[var(--text-on-paper-mut)] pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Recruiter Destination:</strong> <code>{recruiterEmail}</code>
                </span>
              </div>
              {candidateEmail && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Candidate Invitation:</strong> <code>{candidateEmail}</code>
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Interview Questions:</strong> Aria configured {customQuestions.filter(Boolean).length} custom question(s).
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onLaunchSession && onLaunchSession(inviteResult)}
              className="w-full sm:flex-1 py-3 px-4 bg-[var(--ink)] text-[var(--brass-lt)] hover:text-white border border-[var(--brass)]/30 rounded-sm font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <span>Open Interview Room Now</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetForm}
              className="w-full sm:w-auto py-3 px-4 bg-transparent border border-[var(--line-on-paper)] hover:bg-[var(--paper)] text-[var(--text-on-paper)] rounded-sm font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[var(--text-on-paper-mut)]" />
              <span>Arrange Another</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: MAIN RECRUITER SETUP FORM
  // =========================================================================
  return (
    <div className="max-w-3xl mx-auto py-4 px-4 w-full animate-fadeIn">
      {/* Editorial Header */}
      <div className="text-center mb-8">
        <div className="kicker justify-center mb-2.5">
          <span className="dot"></span>
          RECRUITER INTERVIEW ARRANGEMENT
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--text-on-paper)] tracking-tight">
          Arrange Candidate Screening with Aria
        </h1>
        <p className="mt-3 text-[var(--text-on-paper-mut)] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Attach the candidate&apos;s resume so Aria asks deeply grounded questions, specify custom questions, and receive the interview link directly via email.
        </p>
      </div>

      <form className="space-y-6" onSubmit={(e) => handleSubmit(e, true)}>
        {formError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-sm text-xs font-mono">
            ⚠️ {formError}
          </div>
        )}

        {/* Section 1: Recruiter Contact Info */}
        <div className="bg-[var(--paper-2)] rounded-sm border border-[var(--line-on-paper)] p-6 shadow-sm">
          <h2 className="font-serif text-base font-semibold text-[var(--text-on-paper)] flex items-center gap-2 mb-1">
            <Mail className="w-4 h-4 text-[var(--brass)]" />
            1. Recruiter Details (Link & Report Destination)
          </h2>
          <p className="text-xs text-[var(--text-on-paper-mut)] mb-4">
            Aria will email the direct interview link and the final comprehensive evaluation report to this address.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[var(--text-on-paper-mut)] mb-1.5">
                Recruiter Name
              </label>
              <input
                type="text"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3.5 py-2.5 bg-[var(--paper)] border border-[var(--line-on-paper)] rounded-sm text-sm text-[var(--text-on-paper)] focus:outline-none focus:border-[var(--brass)]"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[var(--text-on-paper-mut)] mb-1.5">
                Recruiter Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
                placeholder="sarah.jenkins@company.com"
                className="w-full px-3.5 py-2.5 bg-[var(--paper)] border border-[var(--line-on-paper)] rounded-sm text-sm text-[var(--text-on-paper)] focus:outline-none focus:border-[var(--brass)]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Candidate Resume Upload (Grounds Aria's Questions!) */}
        <div className="bg-[var(--paper-2)] rounded-sm border border-[var(--line-on-paper)] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
            <h2 className="font-serif text-base font-semibold text-[var(--text-on-paper)] flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[var(--brass)]" />
              2. Candidate Resume (Aria Question Grounding)
            </h2>
            <span className="font-mono text-[11px] text-[var(--brass)] uppercase font-semibold">
              Recommended for Deep Tailoring
            </span>
          </div>
          <p className="text-xs text-[var(--text-on-paper-mut)] mb-4">
            Attach the candidate&apos;s resume (PDF or DOCX). Aria will analyze their exact past companies, projects, and tech stack to ask sharp, resume-grounded questions.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
            accept=".pdf,.docx,.txt"
            className="hidden"
          />

          {!resumeFile && !parsingResume && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`p-6 border-2 border-dashed rounded-sm text-center transition-all cursor-pointer ${
                dragActive
                  ? "border-[var(--brass)] bg-[var(--paper)]"
                  : "border-[var(--line-on-paper)] hover:border-[var(--brass)]/60 bg-[var(--paper)]/50"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="w-8 h-8 text-[var(--brass)] mx-auto mb-2" />
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-on-paper)]">
                Click to attach Candidate Resume or drag & drop
              </div>
              <p className="text-[11px] text-[var(--text-on-paper-mut)] mt-1">
                Supports PDF, DOCX, or plain text
              </p>

              <div className="mt-4 pt-3 border-t border-[var(--line-on-paper)] flex items-center justify-center gap-2">
                <span className="text-[11px] text-[var(--text-on-paper-mut)]">Quick test:</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadSampleResume();
                  }}
                  className="px-2.5 py-1 bg-[var(--paper-2)] hover:bg-[var(--brass)]/10 text-[var(--brass)] border border-[var(--brass)]/30 rounded-xs font-mono text-[10px] uppercase font-bold tracking-wider transition-all"
                >
                  ⚡ Attach Sample Candidate Resume
                </button>
              </div>
            </div>
          )}

          {parsingResume && (
            <div className="p-8 border border-[var(--line-on-paper)] bg-[var(--paper)] rounded-sm text-center">
              <Loader2 className="w-7 h-7 text-[var(--brass)] animate-spin mx-auto mb-2" />
              <div className="font-mono text-xs uppercase tracking-wider text-[var(--text-on-paper)]">
                Extracting candidate profile with Gemini 3.6...
              </div>
              <p className="text-[11px] text-[var(--text-on-paper-mut)] mt-1">
                Parsing past roles, architectures, projects, and skills for Aria
              </p>
            </div>
          )}

          {resumeFile && parsedProfile && !parsingResume && (
            <div className="p-4 bg-[var(--paper)] border border-emerald-600/30 rounded-sm relative">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-sm bg-emerald-900/10 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-700/20">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-semibold text-sm text-[var(--text-on-paper)]">
                        {parsedProfile.name || candidateName || "Candidate Profile"}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase rounded-xs">
                        ● Resume Grounded
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-on-paper-mut)] mt-0.5">
                      {resumeFile.name || "Resume Attached"} &bull; {parsedProfile.years_experience || 2}+ years exp
                    </div>

                    {parsedProfile.past_roles && parsedProfile.past_roles.length > 0 && (
                      <div className="text-xs text-[var(--text-on-paper)] font-mono mt-1.5">
                        Recent: {parsedProfile.past_roles[0].title} at {parsedProfile.past_roles[0].company}
                      </div>
                    )}

                    {parsedProfile.skills && parsedProfile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {parsedProfile.skills.slice(0, 6).map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-[var(--paper-2)] border border-[var(--line-on-paper)] text-[var(--text-on-paper)] text-[10px] font-mono rounded-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {parsedProfile.skills.length > 6 && (
                          <span className="text-[10px] font-mono text-[var(--text-on-paper-mut)] self-center">
                            +{parsedProfile.skills.length - 6} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveResume}
                  className="text-xs text-rose-600 hover:text-rose-700 font-mono underline cursor-pointer shrink-0"
                >
                  Change Resume
                </button>
              </div>
            </div>
          )}

          {resumeError && (
            <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-sm text-xs font-mono">
              ⚠️ {resumeError}
            </div>
          )}
        </div>

        {/* Section 3: Candidate Details & Evaluation Settings */}
        <div className="bg-[var(--paper-2)] rounded-sm border border-[var(--line-on-paper)] p-6 shadow-sm">
          <h2 className="font-serif text-base font-semibold text-[var(--text-on-paper)] flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-[var(--brass)]" />
            3. Candidate Profile & Evaluation Benchmark
          </h2>
          <p className="text-xs text-[var(--text-on-paper-mut)] mb-4">
            Specify the role, calibration difficulty, and candidate email for invitation delivery.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[var(--text-on-paper-mut)] mb-1.5">
                Candidate Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g. Jesse Pinkman"
                className="w-full px-3.5 py-2.5 bg-[var(--paper)] border border-[var(--line-on-paper)] rounded-sm text-sm text-[var(--text-on-paper)] focus:outline-none focus:border-[var(--brass)]"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[var(--text-on-paper-mut)] mb-1.5">
                Candidate Email (To Send Invite Link)
              </label>
              <input
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                placeholder="jesse@techcorp.io"
                className="w-full px-3.5 py-2.5 bg-[var(--paper)] border border-[var(--line-on-paper)] rounded-sm text-sm text-[var(--text-on-paper)] focus:outline-none focus:border-[var(--brass)]"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[var(--text-on-paper-mut)] mb-1.5">
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Staff Distributed Systems Engineer"
                className="w-full px-3.5 py-2.5 bg-[var(--paper)] border border-[var(--line-on-paper)] rounded-sm text-sm text-[var(--text-on-paper)] focus:outline-none focus:border-[var(--brass)]"
              />
            </div>

            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[var(--text-on-paper-mut)] mb-1.5">
                Seniority Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[var(--paper)] border border-[var(--line-on-paper)] rounded-sm text-sm text-[var(--text-on-paper)] focus:outline-none focus:border-[var(--brass)]"
              >
                <option value="junior">Junior (Core fundamentals & syntax)</option>
                <option value="mid">Mid-Level (Production experience & APIs)</option>
                <option value="senior">Senior (Architecture, scale, trade-offs)</option>
                <option value="lead">Staff / Lead (Distributed consensus & high availability)</option>
              </select>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--line-on-paper)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--text-on-paper)]">
                Question Target Limit: {targetQuestionCount} Questions
              </div>
              <p className="text-[11px] text-[var(--text-on-paper-mut)]">
                Aria will smoothly conclude the evaluation when this limit is reached.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {[3, 5, 8].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setTargetQuestionCount(count)}
                  className={`px-3 py-1.5 rounded-xs font-mono text-xs font-bold cursor-pointer transition-all ${
                    targetQuestionCount === count
                      ? "bg-[var(--ink)] text-[var(--brass-lt)] border border-[var(--brass)]"
                      : "bg-[var(--paper)] border border-[var(--line-on-paper)] text-[var(--text-on-paper-mut)]"
                  }`}
                >
                  {count} Questions
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Recruiter Custom Questions */}
        <div className="bg-[var(--paper-2)] rounded-sm border border-[var(--line-on-paper)] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-serif text-base font-semibold text-[var(--text-on-paper)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--brass)]" />
              4. Recruiter Custom Questions (Required for Aria to Ask)
            </h2>
            <span className="font-mono text-xs text-[var(--brass)] font-semibold">
              {customQuestions.length}/8 Configured
            </span>
          </div>
          <p className="text-xs text-[var(--text-on-paper-mut)] mb-4">
            Add the mandatory technical questions Aria must present. Aria will weave them seamlessly with the candidate&apos;s resume.
          </p>

          <div className="space-y-3">
            {customQuestions.map((q, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <span className="w-6 h-9 flex items-center justify-center font-mono text-xs font-bold text-[var(--brass)] shrink-0">
                  #{idx + 1}
                </span>
                <textarea
                  rows={2}
                  value={q}
                  onChange={(e) => handleUpdateQuestion(idx, e.target.value)}
                  placeholder={`Question ${idx + 1}: e.g. How do you prevent cache stampedes in Redis under peak load?`}
                  className="flex-1 px-3.5 py-2 bg-[var(--paper)] border border-[var(--line-on-paper)] rounded-sm text-xs sm:text-sm text-[var(--text-on-paper)] focus:outline-none focus:border-[var(--brass)] resize-none"
                />
                {customQuestions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="p-2 text-[var(--text-on-paper-mut)] hover:text-rose-600 transition-colors cursor-pointer"
                    title="Remove question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {customQuestions.length < 8 && (
            <button
              type="button"
              onClick={handleAddQuestion}
              className="mt-4 px-3.5 py-2 bg-[var(--paper)] border border-dashed border-[var(--line-on-paper)] hover:border-[var(--brass)] text-[var(--text-on-paper)] rounded-sm font-mono text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[var(--brass)]" />
              <span>Add Another Question</span>
            </button>
          )}
        </div>

        {/* Section 5: Recruiter Special Instructions for Aria */}
        <div className="bg-[var(--paper-2)] rounded-sm border border-[var(--line-on-paper)] p-6 shadow-sm">
          <h2 className="font-serif text-base font-semibold text-[var(--text-on-paper)] flex items-center gap-2 mb-1">
            <Sliders className="w-4 h-4 text-[var(--brass)]" />
            5. Special Evaluation Instructions for Aria
          </h2>
          <p className="text-xs text-[var(--text-on-paper-mut)] mb-3">
            Instruct Aria on specific skills to probe, failure modes to grill, or communication aspects to assess.
          </p>
          <textarea
            rows={2}
            value={recruiterInstructions}
            onChange={(e) => setRecruiterInstructions(e.target.value)}
            placeholder="e.g. Probe deeply into their AWS IAM lock-down instincts and see if they defend their architectural choices clearly."
            className="w-full px-3.5 py-2.5 bg-[var(--paper)] border border-[var(--line-on-paper)] rounded-sm text-sm text-[var(--text-on-paper)] focus:outline-none focus:border-[var(--brass)] resize-none"
          />
        </div>

        {/* Two Submission Options */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={(e) => handleSubmit(e, false)}
            className="px-5 py-3 bg-[var(--paper)] hover:bg-[var(--paper-2)] border border-[var(--line-on-paper)] text-[var(--text-on-paper)] rounded-sm font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Start Live Now in Browser</span>
            <ArrowRight className="w-3.5 h-3.5 text-[var(--brass)]" />
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 bg-[var(--ink)] text-[var(--brass-lt)] hover:text-white border border-[var(--brass)]/40 rounded-sm font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[var(--brass)]" />
                <span>Initializing Aria Session & Dispatched Links...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-[var(--brass)]" />
                <span>Generate Link & Send Email Invitation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

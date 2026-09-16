"use client";

import { useState } from "react";
import { User, Briefcase, GraduationCap, Code, Sparkles, ArrowRight, ArrowLeft, Sliders, CheckCircle2 } from "lucide-react";

export default function ProfileReview({ parsedData, onBack, onStartInterview, loading }) {
  const { profile = {}, candidate = {} } = parsedData;

  const [name, setName] = useState(profile.name || candidate.name || "Candidate");
  const [targetRole, setTargetRole] = useState(
    (profile.target_roles && profile.target_roles[0]) || "Software Engineer"
  );
  const [difficulty, setDifficulty] = useState("mid");
  const [questionCount, setQuestionCount] = useState(5);
  const [skills, setSkills] = useState(profile.skills || []);
  const [newSkill, setNewSkill] = useState("");

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleStart = () => {
    onStartInterview({
      candidateId: parsedData.candidateId || candidate.id,
      role: targetRole,
      difficulty,
      targetQuestionCount: questionCount,
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 w-full">
      {/* Navigation & Progress Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[var(--line-on-paper)]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[var(--text-on-paper-mut)] hover:text-[var(--text-on-paper)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[var(--brass)]" />
          <span>← BACK TO RESUME UPLOAD</span>
        </button>
        <span className="text-xs font-mono text-[var(--brass)] tracking-wider">
          STEP 2 OF 3 • PROFILE & PARAMETER CONFIGURATION
        </span>
      </div>

      {/* Editorial Title */}
      <div className="text-center mb-10">
        <div className="kicker justify-center mb-2.5">
          <span className="dot"></span>
          AUTONOMOUS SCREENING PARAMETERS
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[var(--text-on-paper)] tracking-tight">
          Review Your Extracted Profile
        </h1>
        <p className="mt-3 text-[var(--text-on-paper-mut)] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
          Gemini has parsed your resume structure. Confirm your credentials and set your target interview parameters before Aria begins.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Profile details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Info */}
          <div className="bg-[var(--paper-2)] rounded-sm border border-[var(--line-on-paper)] p-6 shadow-sm">
            <h2 className="font-serif text-base font-semibold text-[var(--text-on-paper)] flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-[var(--brass)]" />
              Candidate Identity
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[var(--text-on-paper-mut)] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--paper)] border border-[var(--line-on-paper)] rounded-sm text-sm text-[var(--text-on-paper)] focus:outline-none focus:border-[var(--brass)] transition-colors"
                />
              </div>
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[var(--text-on-paper-mut)] mb-1.5">
                  Experience Assessed
                </label>
                <div className="px-3.5 py-2.5 bg-[var(--paper)] border border-[var(--line-on-paper)] rounded-sm text-sm text-[var(--text-on-paper)] font-mono font-medium flex items-center justify-between">
                  <span>{profile.years_experience ? `${profile.years_experience} Years Verified` : "Senior / Experienced"}</span>
                  <CheckCircle2 className="w-4 h-4 text-[var(--sage)]" />
                </div>
              </div>
            </div>
          </div>

          {/* Skills Chips */}
          <div className="bg-[var(--paper-2)] rounded-sm border border-[var(--line-on-paper)] p-6 shadow-sm">
            <h2 className="font-serif text-base font-semibold text-[var(--text-on-paper)] flex items-center gap-2 mb-2">
              <Code className="w-4 h-4 text-[var(--brass)]" />
              Verified Competencies & Skills
            </h2>
            <p className="text-xs text-[var(--text-on-paper-mut)] mb-4">
              Aria references these competencies to generate context-specific architectural questions:
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--paper)] text-[var(--text-on-paper)] border border-[var(--line-on-paper)] rounded-sm font-mono text-xs shadow-2xs hover:border-[var(--brass)] transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--brass)]"></span>
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-600 font-bold ml-1 text-xs opacity-60 hover:opacity-100"
                    title="Remove skill"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                placeholder="Add another competency (e.g. Kubernetes, Rust)..."
                className="flex-1 px-3.5 py-2 bg-[var(--paper)] border border-[var(--line-on-paper)] rounded-sm text-xs text-[var(--text-on-paper)] focus:outline-none focus:border-[var(--brass)]"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--ink-2)] text-xs font-mono font-medium rounded-sm transition-colors border border-[var(--line-on-paper)]"
              >
                + ADD
              </button>
            </div>
          </div>

          {/* Work History Snapshot */}
          {profile.past_roles && profile.past_roles.length > 0 && (
            <div className="bg-[var(--paper-2)] rounded-sm border border-[var(--line-on-paper)] p-6 shadow-sm">
              <h2 className="font-serif text-base font-semibold text-[var(--text-on-paper)] flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-[var(--brass)]" />
                Experience History
              </h2>
              <div className="space-y-3">
                {profile.past_roles.slice(0, 3).map((role, idx) => (
                  <div key={idx} className="border-l-2 border-[var(--brass)] pl-3.5 py-1 bg-[var(--paper)]/50 rounded-r-sm">
                    <p className="font-serif text-sm font-semibold text-[var(--text-on-paper)]">{role.title}</p>
                    <p className="font-mono text-xs text-[var(--text-on-paper-mut)] mt-0.5">
                      {role.company} {role.duration ? `• ${role.duration}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Snapshot */}
          {profile.education && profile.education.length > 0 && (
            <div className="bg-[var(--paper-2)] rounded-sm border border-[var(--line-on-paper)] p-6 shadow-sm">
              <h2 className="font-serif text-base font-semibold text-[var(--text-on-paper)] flex items-center gap-2 mb-3">
                <GraduationCap className="w-4 h-4 text-[var(--brass)]" />
                Education & Credentials
              </h2>
              <div className="space-y-2">
                {profile.education.map((edu, idx) => (
                  <div key={idx} className="text-xs text-[var(--text-on-paper)] font-mono">
                    <span className="font-bold text-[var(--text-on-paper)]">{edu.degree}</span> — {edu.institution} {edu.year ? `(${edu.year})` : ""}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Interview Settings & Launch */}
        <div className="space-y-6">
          <div className="bg-[var(--ink)] text-[var(--text-on-ink)] rounded-sm border border-[var(--brass)]/40 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brass)]/10 rounded-full blur-2xl pointer-events-none"></div>

            <h2 className="font-serif text-lg font-semibold text-[var(--paper)] flex items-center gap-2 mb-4 border-b border-[var(--line-on-ink)] pb-3">
              <Sliders className="w-4 h-4 text-[var(--brass-lt)]" />
              Screening Controls
            </h2>

            {/* Target Role */}
            <div className="mb-5">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[var(--text-on-ink-mut)] mb-2">
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full px-3.5 py-2.5 bg-[var(--ink-2)] border border-[var(--ink-3)] rounded-sm text-sm text-[var(--paper)] focus:outline-none focus:border-[var(--brass)] font-sans"
              />
            </div>

            {/* Difficulty */}
            <div className="mb-5">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[var(--text-on-ink-mut)] mb-2">
                Evaluation Rigor
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["junior", "mid", "senior"].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2 text-xs font-mono font-semibold uppercase tracking-wider rounded-sm transition-all ${
                      difficulty === lvl
                        ? "bg-[var(--brass)] text-[var(--ink)] font-bold shadow-md"
                        : "bg-[var(--ink-2)] text-[var(--text-on-ink-mut)] hover:text-[var(--text-on-ink)] border border-[var(--line-on-ink)]"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Count Target */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-on-ink-mut)]">
                  Target Length:
                </label>
                <span className="font-mono text-xs font-bold text-[var(--brass-lt)]">
                  {questionCount} Questions
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={10}
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                className="w-full accent-[var(--brass)] cursor-pointer"
              />
              <div className="flex justify-between font-mono text-[10px] text-[var(--text-on-ink-mut)] mt-1.5">
                <span>3 (Express ~8m)</span>
                <span>5 (Standard ~15m)</span>
                <span>10 (Deep ~30m)</span>
              </div>
            </div>

            {/* Policy notice */}
            <div className="mb-6 p-3 bg-[var(--ink-2)] rounded-sm border border-[var(--line-on-ink)] text-[11px] text-[var(--text-on-ink-mut)] space-y-1">
              <div className="flex items-center gap-1.5 font-mono text-[var(--brass-lt)] font-semibold">
                <span>● INTEGRITY POLICY ACTIVE</span>
              </div>
              <p>Camera feed is streamed locally. Tab switching triggers an audible warning and recruiter audit logs.</p>
            </div>

            {/* Launch CTA */}
            <button
              type="button"
              disabled={loading}
              onClick={handleStart}
              className="w-full py-3.5 px-4 bg-[var(--brass)] hover:bg-[var(--brass-lt)] text-[var(--ink)] font-mono font-bold text-xs uppercase tracking-wider rounded-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? "INITIALIZING ARIA ROOM..." : "LAUNCH INTERVIEW ROOM"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ShieldCheck, Lock, Clock, EyeOff, FileText, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Privacy Policy & Data Retention Guarantee — Veritas AI",
  description:
    "Learn about Veritas AI's strict biometric minimization, 90-day data retention, and candidate appeal guarantees.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="pt-32 pb-24" style={{ background: "var(--paper)" }}>
      <div className="wrap max-w-4xl space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="kicker">
            <span className="dot"></span>
            TRUST, SAFETY &amp; COMPLIANCE
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--text-on-paper)] leading-tight">
            Privacy Policy &amp; Data Ethics Guarantee
          </h1>
          <p className="text-sm font-mono text-[var(--text-on-paper-mut)]">
            Effective Date: September 2026 · Version 1.2
          </p>
          <p className="text-base text-[var(--text-on-paper-mut)] leading-relaxed">
            At Veritas AI, we believe technical evaluation should be respectful, transparent, and grounded in trust. We design our AI interviewer, Aria, with strict data minimization principles so you can interview with confidence.
          </p>
        </div>

        {/* 4 Summary Trust Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[var(--paper-2)] p-5 rounded border border-[var(--line-on-paper)] space-y-2">
            <div className="w-8 h-8 rounded border border-[var(--brass)] text-[var(--brass)] flex items-center justify-center">
              <EyeOff className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-semibold text-base text-[var(--text-on-paper)]">
              Zero Video Storage
            </h3>
            <p className="text-xs text-[var(--text-on-paper-mut)] leading-relaxed">
              Webcam verification runs entirely inside your browser. No raw video or facial biometric recognition databases are stored or streamed to our servers.
            </p>
          </div>

          <div className="bg-[var(--paper-2)] p-5 rounded border border-[var(--line-on-paper)] space-y-2">
            <div className="w-8 h-8 rounded border border-[var(--brass)] text-[var(--brass)] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-semibold text-base text-[var(--text-on-paper)]">
              90-Day Ephemeral Retention
            </h3>
            <p className="text-xs text-[var(--text-on-paper-mut)] leading-relaxed">
              Uploaded resumes, transcripts, and evaluation scorecards are automatically purged after 90 days unless explicitly saved by the hiring organization.
            </p>
          </div>

          <div className="bg-[var(--paper-2)] p-5 rounded border border-[var(--line-on-paper)] space-y-2">
            <div className="w-8 h-8 rounded border border-[var(--brass)] text-[var(--brass)] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-semibold text-base text-[var(--text-on-paper)]">
              Human Appeal Guarantee
            </h3>
            <p className="text-xs text-[var(--text-on-paper-mut)] leading-relaxed">
              Automated systems never unilaterally eliminate candidates. Every proctoring flag is reviewable and appealable directly to human recruiters.
            </p>
          </div>

          <div className="bg-[var(--paper-2)] p-5 rounded border border-[var(--line-on-paper)] space-y-2">
            <div className="w-8 h-8 rounded border border-[var(--brass)] text-[var(--brass)] flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-semibold text-base text-[var(--text-on-paper)]">
              Candidate Rights (GDPR &amp; CCPA)
            </h3>
            <p className="text-xs text-[var(--text-on-paper-mut)] leading-relaxed">
              You maintain full rights to inspect, download a copy, rectify, or request immediate permanent erasure of your profile and interview data.
            </p>
          </div>
        </div>

        {/* Detailed Articles */}
        <div className="space-y-10 border-t border-[var(--line-on-paper)] pt-8 text-sm text-[var(--text-on-paper-mut)] leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[var(--text-on-paper)]">
              1. Information We Collect
            </h2>
            <p>
              When you use Veritas AI, we collect only the information necessary to conduct your interview:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-[var(--text-on-paper)]">Account Details:</strong> Name, email address, and authentication provider identifiers (Google OAuth, GitHub OAuth, or encrypted password hash).
              </li>
              <li>
                <strong className="text-[var(--text-on-paper)]">Resume Documentation:</strong> Work chronology, listed technical proficiencies, education, and project descriptions extracted from uploaded PDF/DOCX files.
              </li>
              <li>
                <strong className="text-[var(--text-on-paper)]">Interview Transcripts &amp; Audio:</strong> Spoken answers submitted via microphone, synthesized prompts by Aria, and numerical scoring evaluations.
              </li>
              <li>
                <strong className="text-[var(--text-on-paper)]">Integrity Event Telemetry:</strong> Window blur (tab switching), answer paste events, and local webcam face presence signals.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[var(--text-on-paper)]">
              2. How We Use Your Information
            </h2>
            <p>
              Your data is utilized exclusively for generating personalized interview questions with Google Gemini, assessing technical capability, and presenting actionable scorecards to recruiters. We do not sell candidate data to third-party data brokers or use private candidate resumes to train foundational public LLMs.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[var(--text-on-paper)]">
              3. Data Retention &amp; Automatic Purging
            </h2>
            <p>
              By default, interview sessions, audio records, and resume artifacts are retained for <strong>90 calendar days</strong> following the interview completion date. After 90 days, automated cron jobs permanently delete all session details from PostgreSQL storage.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[var(--text-on-paper)]">
              4. Cookies &amp; Local Storage
            </h2>
            <p>
              Veritas AI uses minimal first-party cookies and local storage tokens strictly required for session persistence (`veritas_token`) and consent preferences (`veritas_cookie_consent`). We do not deploy invasive third-party cross-site advertising trackers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[var(--text-on-paper)]">
              5. Contact Our Privacy Officer
            </h2>
            <p>
              For data erasure requests, GDPR inquiries, or appeal reviews, contact our Data Governance Team at{" "}
              <a href="mailto:privacy@veritasai.com" className="text-[var(--brass)] hover:underline font-mono">
                privacy@veritasai.com
              </a>
              .
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="pt-6 border-t border-[var(--line-on-paper)] flex items-center justify-between flex-wrap gap-4">
          <Link href="/terms" className="text-xs font-mono text-[var(--text-on-paper-mut)] hover:text-[var(--brass)]">
            Read Terms of Service →
          </Link>
          <Link href="/interview" className="btn btn-brass btn-sm">
            <span>Start Practice Interview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}

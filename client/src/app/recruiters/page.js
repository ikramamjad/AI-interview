"use client";

import Link from "next/link";
import { Clock, ShieldCheck, TrendingUp, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RecruitersPage() {
  const { openAuthModal } = useAuth();

  return (
    <main className="pt-32 pb-24" style={{ background: "var(--paper)" }}>
      <div className="wrap space-y-16">
        {/* Header */}
        <div className="max-w-2xl">
          <div className="kicker">
            <span className="dot"></span>
            FOR HIRING TEAMS &amp; TALENT ACQUISITION
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--text-on-paper)] leading-tight">
            Autonomous Technical Screening at Scale
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[var(--text-on-paper-mut)] leading-relaxed">
            Eliminate 15–20 hours of recruiter phone screens per open requisition. Aria interviews candidates concurrently with zero scheduling friction, deep resume grounding, and tamper-proof proctoring.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/interview?mode=recruiter"
              className="btn btn-brass"
            >
              <span>Arrange an Interview with Aria</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/interview?mode=practice" className="btn btn-outline-paper">
              Candidate Practice Mode
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[var(--paper-2)] border border-[var(--line-on-paper)] p-6 rounded-sm text-center space-y-2">
            <div className="w-9 h-9 rounded border border-[var(--brass)] text-[var(--brass)] mx-auto flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div className="font-serif text-3xl font-semibold text-[var(--text-on-paper)]">85%</div>
            <div className="font-mono text-xs uppercase tracking-wider text-[var(--text-on-paper)]">Time-to-Screen Saved</div>
            <p className="text-xs text-[var(--text-on-paper-mut)]">Interviews complete in 15 minutes instead of 5-day calendar coordination lags.</p>
          </div>

          <div className="bg-[var(--paper-2)] border border-[var(--line-on-paper)] p-6 rounded-sm text-center space-y-2">
            <div className="w-9 h-9 rounded border border-[var(--brass)] text-[var(--brass)] mx-auto flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="font-serif text-3xl font-semibold text-[var(--text-on-paper)]">&lt; 2%</div>
            <div className="font-mono text-xs uppercase tracking-wider text-[var(--text-on-paper)]">Dispute Rate</div>
            <p className="text-xs text-[var(--text-on-paper-mut)]">Fair two-strike policy prevents unfair lockouts while deterring dishonest assistance.</p>
          </div>

          <div className="bg-[var(--paper-2)] border border-[var(--line-on-paper)] p-6 rounded-sm text-center space-y-2">
            <div className="w-9 h-9 rounded border border-[var(--brass)] text-[var(--brass)] mx-auto flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="font-serif text-3xl font-semibold text-[var(--text-on-paper)]">3.2×</div>
            <div className="font-mono text-xs uppercase tracking-wider text-[var(--text-on-paper)]">Higher Onsite Pass Rate</div>
            <p className="text-xs text-[var(--text-on-paper-mut)]">Only candidates with proven architectural depth reach expensive senior engineer loops.</p>
          </div>
        </div>

        {/* Workflow */}
        <div className="bg-[var(--ink)] text-[var(--text-on-ink)] border border-[var(--line-on-ink)] rounded-sm p-8 space-y-6">
          <div className="sec-head" style={{ marginBottom: "20px" }}>
            <div className="sec-rule"></div>
            <h2 className="text-[var(--text-on-ink)]">The Recruiter Workflow</h2>
            <p className="text-[var(--text-on-ink-mut)]">Four streamlined steps to screen applicants automatically.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded bg-[var(--ink-2)] border border-[var(--line-on-ink)]">
              <span className="font-mono text-xs text-[var(--brass-lt)]">Step 01</span>
              <h4 className="font-serif text-sm font-semibold text-[var(--text-on-ink)] mt-1 mb-2">Create Campaign</h4>
              <p className="text-xs text-[var(--text-on-ink-mut)]">Define role title, target seniority (Junior, Mid, Senior), and key competencies.</p>
            </div>

            <div className="p-4 rounded bg-[var(--ink-2)] border border-[var(--line-on-ink)]">
              <span className="font-mono text-xs text-[var(--brass-lt)]">Step 02</span>
              <h4 className="font-serif text-sm font-semibold text-[var(--text-on-ink)] mt-1 mb-2">Invite Candidates</h4>
              <p className="text-xs text-[var(--text-on-ink-mut)]">Share automated link via ATS or email; candidates complete the session on their schedule.</p>
            </div>

            <div className="p-4 rounded bg-[var(--ink-2)] border border-[var(--line-on-ink)]">
              <span className="font-mono text-xs text-[var(--brass-lt)]">Step 03</span>
              <h4 className="font-serif text-sm font-semibold text-[var(--text-on-ink)] mt-1 mb-2">Review Scorecard</h4>
              <p className="text-xs text-[var(--text-on-ink-mut)]">Receive AI-generated summary with technical scores, strengths, and transcript highlights.</p>
            </div>

            <div className="p-4 rounded bg-[var(--ink-2)] border border-[var(--line-on-ink)]">
              <span className="font-mono text-xs text-[var(--brass-lt)]">Step 04</span>
              <h4 className="font-serif text-sm font-semibold text-[var(--text-on-ink)] mt-1 mb-2">Make Confident Decisions</h4>
              <p className="text-xs text-[var(--text-on-ink-mut)]">Advance top engineering talent directly to final loops with verified proctoring audit trails.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

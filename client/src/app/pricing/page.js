"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function PricingPage() {
  const { openAuthModal } = useAuth();

  return (
    <main className="pt-32 pb-24" style={{ background: "var(--paper)" }}>
      <div className="wrap space-y-16">
        {/* Header */}
        <div className="max-w-2xl">
          <div className="kicker">
            <span className="dot"></span>
            TRANSPARENT RECORD PRICING
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--text-on-paper)] leading-tight">
            Plans for Engineers &amp; Hiring Teams
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[var(--text-on-paper-mut)] leading-relaxed">
            Whether you&apos;re an engineer preparing for upcoming interviews or an engineering organization screening talent at scale.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* Plan 1: Free */}
          <div className="bg-[var(--paper-2)] border border-[var(--line-on-paper)] p-8 rounded-sm flex flex-col justify-between">
            <div className="space-y-4">
              <span className="font-mono text-[11px] text-[var(--brass)] uppercase tracking-wider block">
                Candidate Free
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl font-semibold text-[var(--text-on-paper)]">$0</span>
                <span className="font-mono text-xs text-[var(--text-on-paper-mut)]">/ forever</span>
              </div>
              <p className="text-xs text-[var(--text-on-paper-mut)]">
                For engineers wanting to test their interview readiness with Aria.
              </p>

              <ul className="space-y-2.5 text-xs text-[var(--text-on-paper-mut)] pt-4 border-t border-[var(--line-on-paper)]">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[var(--sage)]" />
                  <span>Resume upload &amp; structured parsing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[var(--sage)]" />
                  <span>Adaptive Q&amp;A with Aria</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[var(--sage)]" />
                  <span>Voice synthesis &amp; microphone dictation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[var(--sage)]" />
                  <span>Junior, Mid, Senior difficulty levels</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link href="/interview" className="w-full btn btn-outline-paper btn-sm text-center block">
                Start Free Interview
              </Link>
            </div>
          </div>

          {/* Plan 2: Pro */}
          <div className="bg-[var(--ink)] text-[var(--text-on-ink)] border border-[var(--brass)] p-8 rounded-sm relative flex flex-col justify-between">
            <div className="space-y-4">
              <span className="font-mono text-[11px] text-[var(--brass-lt)] uppercase tracking-wider block">
                Candidate Pro
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl font-semibold text-[var(--text-on-ink)]">$19</span>
                <span className="font-mono text-xs text-[var(--text-on-ink-mut)]">/ month</span>
              </div>
              <p className="text-xs text-[var(--text-on-ink-mut)]">
                Unlimited technical practice with full AI scorecards and actionable growth feedback.
              </p>

              <ul className="space-y-2.5 text-xs text-[var(--text-on-ink-mut)] pt-4 border-t border-[var(--line-on-ink)]">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[var(--brass-lt)]" />
                  <span className="text-[var(--text-on-ink)] font-medium">Everything in Free, plus:</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[var(--brass-lt)]" />
                  <span>Unlimited interview sessions</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[var(--brass-lt)]" />
                  <span>Comprehensive 0–100 AI Scorecard</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[var(--brass-lt)]" />
                  <span>Detailed rubric breakdown by engineering skill</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                type="button"
                onClick={() => openAuthModal("signup")}
                className="w-full btn btn-brass btn-sm text-center block"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>

          {/* Plan 3: Recruiter */}
          <div className="bg-[var(--paper-2)] border border-[var(--line-on-paper)] p-8 rounded-sm flex flex-col justify-between">
            <div className="space-y-4">
              <span className="font-mono text-[11px] text-[var(--brass)] uppercase tracking-wider block">
                Recruiter Screening
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-4xl font-semibold text-[var(--text-on-paper)]">$149</span>
                <span className="font-mono text-xs text-[var(--text-on-paper-mut)]">/ month</span>
              </div>
              <p className="text-xs text-[var(--text-on-paper-mut)]">
                For talent acquisition and hiring teams automating technical first-round screens.
              </p>

              <ul className="space-y-2.5 text-xs text-[var(--text-on-paper-mut)] pt-4 border-t border-[var(--line-on-paper)]">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[var(--sage)]" />
                  <span>Up to 100 candidate screens / month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[var(--sage)]" />
                  <span>Custom campaign invite links</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[var(--sage)]" />
                  <span>Live proctoring &amp; audit evidence logs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[var(--sage)]" />
                  <span>Human review &amp; appeal dashboard</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                type="button"
                onClick={() => openAuthModal("signup")}
                className="w-full btn btn-outline-paper btn-sm text-center block"
              >
                Start Recruiter Trial
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

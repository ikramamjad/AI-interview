import Link from "next/link";
import { Shield, FileCheck, Camera, Copy, Award, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Integrity & Proctoring Architecture — Veritas AI",
  description:
    "Explore the 4 core engines of Veritas AI: Resume Ingestion, Anti-Cheating Guardian, Voice Synthesis, and Explainable Scorecards.",
  alternates: {
    canonical: "/features",
  },
};

export default function FeaturesPage() {
  return (
    <main className="pt-32 pb-24" style={{ background: "var(--paper)" }}>
      <div className="wrap space-y-16">
        {/* Header */}
        <div className="max-w-2xl">
          <div className="kicker">
            <span className="dot"></span>
            INTEGRITY-FIRST ARCHITECTURE
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--text-on-paper)] leading-tight">
            How Veritas AI Operates End-to-End
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[var(--text-on-paper-mut)] leading-relaxed">
            A comprehensive architectural view of our four core engines: Resume Ingestion, Conversational Voice Screening, Anti-Cheating Guardian, and Explainable Scorecards.
          </p>
        </div>

        {/* Engine 1 */}
        <div className="bg-[var(--paper-2)] border border-[var(--line-on-paper)] rounded-sm p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded border border-[var(--brass)] text-[var(--brass)] flex items-center justify-center font-serif text-sm font-semibold">
              01
            </div>
            <div>
              <span className="font-mono text-xs text-[var(--brass)] uppercase tracking-wider">Engine 01</span>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[var(--text-on-paper)]">
                Resume Extraction &amp; Prompt-Injection Defense
              </h2>
            </div>
          </div>
          <p className="text-sm text-[var(--text-on-paper-mut)] leading-relaxed">
            Candidates upload standard PDF or DOCX resumes. Our backend extracts text server-side, applies strict prompt-injection sanitization to neutralize malicious instruction overrides, and structures the profile with Google Gemini into normalized technical skill profiles and project chronologies.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded bg-[var(--paper)] border border-[var(--line-on-paper)]">
              <h4 className="font-serif text-xs font-semibold text-[var(--text-on-paper)] mb-1">Defense in Depth</h4>
              <p className="text-xs text-[var(--text-on-paper-mut)]">Strips attempts like &quot;ignore previous instructions&quot; before reaching LLM context.</p>
            </div>
            <div className="p-4 rounded bg-[var(--paper)] border border-[var(--line-on-paper)]">
              <h4 className="font-serif text-xs font-semibold text-[var(--text-on-paper)] mb-1">Immutable Snapshot</h4>
              <p className="text-xs text-[var(--text-on-paper-mut)]">Locks profile state at interview start time for historical audit integrity.</p>
            </div>
            <div className="p-4 rounded bg-[var(--paper)] border border-[var(--line-on-paper)]">
              <h4 className="font-serif text-xs font-semibold text-[var(--text-on-paper)] mb-1">Interactive Review</h4>
              <p className="text-xs text-[var(--text-on-paper-mut)]">Candidates can review, add, or refine skill chips before the interview commences.</p>
            </div>
          </div>
        </div>

        {/* Engine 2: Anti-Cheating Guardian */}
        <div id="anti-cheating" className="bg-[var(--ink)] text-[var(--text-on-ink)] border border-[var(--line-on-ink)] rounded-sm p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded border border-[var(--brass-lt)] text-[var(--brass-lt)] flex items-center justify-center font-serif text-sm font-semibold">
              02
            </div>
            <div>
              <span className="font-mono text-xs text-[var(--brass-lt)] uppercase tracking-wider">Engine 02</span>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[var(--text-on-ink)]">
                The Anti-Cheating Guardian &amp; Two-Strike Policy
              </h2>
            </div>
          </div>
          <p className="text-sm text-[var(--text-on-ink-mut)] leading-relaxed">
            Veritas AI protects interview integrity without invasive spyware. We monitor three high-signal integrity events and enforce an automated two-strike threshold backed by human recruiter appeals.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded bg-[var(--ink-2)] border border-[var(--line-on-ink)]">
              <h4 className="font-serif text-xs font-semibold text-[var(--text-on-ink)] mb-1">Window &amp; Tab Blur</h4>
              <p className="text-xs text-[var(--text-on-ink-mut)]">Monitors browser visibilitychange events to detect opening search engines or AI assistants.</p>
            </div>
            <div className="p-4 rounded bg-[var(--ink-2)] border border-[var(--line-on-ink)]">
              <h4 className="font-serif text-xs font-semibold text-[var(--text-on-ink)] mb-1">Clipboard Paste Deterrence</h4>
              <p className="text-xs text-[var(--text-on-ink-mut)]">Intercepts sudden high-volume paste events in response textareas, requiring organic answers.</p>
            </div>
            <div className="p-4 rounded bg-[var(--ink-2)] border border-[var(--line-on-ink)]">
              <h4 className="font-serif text-xs font-semibold text-[var(--text-on-ink)] mb-1">Webcam Presence Verification</h4>
              <p className="text-xs text-[var(--text-on-ink-mut)]">Client-side face verification ensures candidate focus without recording invasive surveillance footage.</p>
            </div>
          </div>
        </div>

        {/* Engine 3: Voice */}
        <div id="voice" className="bg-[var(--paper-2)] border border-[var(--line-on-paper)] rounded-sm p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded border border-[var(--brass)] text-[var(--brass)] flex items-center justify-center font-serif text-sm font-semibold">
              03
            </div>
            <div>
              <span className="font-mono text-xs text-[var(--brass)] uppercase tracking-wider">Engine 03</span>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[var(--text-on-paper)]">
                Multi-Modal Audio &amp; Real-Time Voice Engine
              </h2>
            </div>
          </div>
          <p className="text-sm text-[var(--text-on-paper-mut)] leading-relaxed">
            Aria speaks questions aloud through standard Web Speech synthesis with explicit replay controls. Candidates can speak naturally into their microphone, captured via HTML5 MediaRecorder and transcribed server-side via Google Gemini.
          </p>
        </div>

        {/* Engine 4: Scoring */}
        <div className="bg-[var(--paper-2)] border border-[var(--line-on-paper)] rounded-sm p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded border border-[var(--brass)] text-[var(--brass)] flex items-center justify-center font-serif text-sm font-semibold">
              04
            </div>
            <div>
              <span className="font-mono text-xs text-[var(--brass)] uppercase tracking-wider">Engine 04</span>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[var(--text-on-paper)]">
                Explainable Scorecards &amp; Recruiter Audit Trail
              </h2>
            </div>
          </div>
          <p className="text-sm text-[var(--text-on-paper-mut)] leading-relaxed">
            At the conclusion of an interview, Veritas AI compiles a comprehensive report evaluating technical competence, architectural communication, problem-solving agility, and integrity logs. Every score includes direct citations from the transcript.
          </p>
          <div className="pt-4">
            <Link href="/interview" className="btn btn-brass">
              <span>Start an interview now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

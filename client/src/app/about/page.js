import Link from "next/link";
import { Brain, Sliders, ShieldAlert, Eye, Mic, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Meet Aria — Autonomous AI Technical Interviewer",
  description:
    "Explore Aria's architecture: dynamic difficulty scaling, multimodal speech, and deep resume project grounding.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <main className="pt-32 pb-24" style={{ background: "var(--paper)" }}>
      <div className="wrap space-y-20">
        {/* Header */}
        <div className="max-w-2xl">
          <div className="kicker">
            <span className="dot"></span>
            THE INTELLIGENCE BEHIND VERITAS AI
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--text-on-paper)] leading-tight">
            Meet Aria: The Autonomous Technical Interviewer
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[var(--text-on-paper-mut)] leading-relaxed">
            Aria is not a rigid script, a puzzle bank, or an impersonal questionnaire. She is a specialized AI interviewer engineered to conduct conversational, deeply personalized technical screening grounded in your actual engineering record.
          </p>
          <div className="mt-6">
            <Link href="/interview" className="btn btn-brass">
              Experience an interview with Aria
            </Link>
          </div>
        </div>

        {/* Aria Character Panel */}
        <div className="bg-[var(--ink)] text-[var(--text-on-ink)] rounded-md border border-[var(--line-on-ink)] p-8 sm:p-10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
            <div className="lg:col-span-1 text-center lg:text-left">
              <div className="w-20 h-20 rounded-full border border-[var(--brass)] bg-[var(--ink-2)] text-[var(--brass-lt)] flex items-center justify-center font-serif text-2xl font-bold mx-auto lg:mx-0 mb-4">
                AR
              </div>
              <h2 className="font-serif text-2xl font-semibold text-[var(--text-on-ink)]">Aria</h2>
              <p className="font-mono text-xs text-[var(--brass-lt)] mt-0.5">Principal AI Technical Interviewer</p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center lg:justify-start">
                <span className="font-mono text-[10.5px] px-2.5 py-1 rounded-full border border-[var(--line-on-ink)] text-[var(--text-on-ink-mut)]">
                  Adaptive Logic
                </span>
                <span className="font-mono text-[10.5px] px-2.5 py-1 rounded-full border border-[var(--line-on-ink)] text-[var(--text-on-ink-mut)]">
                  Voice Synthesis
                </span>
                <span className="font-mono text-[10.5px] px-2.5 py-1 rounded-full border border-[var(--line-on-ink)] text-[var(--text-on-ink-mut)]">
                  Objective Rubric
                </span>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4 text-sm text-[var(--text-on-ink-mut)] leading-relaxed border-t lg:border-t-0 lg:border-l border-[var(--line-on-ink)] pt-6 lg:pt-0 lg:pl-8">
              <h3 className="font-serif text-lg font-semibold text-[var(--text-on-ink)]">Her Persona & Code of Conduct</h3>
              <p>
                Aria maintains a calm, professional, and encouraging demeanor throughout the interview. She speaks naturally, pauses appropriately, and creates a focused environment that lets candidates showcase their real-world engineering intuition.
              </p>
              <p>
                Unlike automated tests that reward rote keyword memorization, Aria digs into how you architect systems, how you make engineering tradeoffs under real-world constraints, and how you articulate technical decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Pillars Grid */}
        <div className="space-y-8">
          <div className="sec-head" style={{ marginBottom: "32px" }}>
            <div className="sec-rule"></div>
            <h2>What makes Aria different</h2>
            <p>Four engineering pillars built into the Veritas interview engine.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[var(--paper-2)] border border-[var(--line-on-paper)] p-6 rounded-sm space-y-3">
              <div className="w-9 h-9 rounded border border-[var(--brass)] text-[var(--brass)] flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-semibold text-lg text-[var(--text-on-paper)]">1. Deep Project & Resume Grounding</h3>
              <p className="text-sm text-[var(--text-on-paper-mut)] leading-relaxed">
                Aria parses the candidate&apos;s verified resume, isolating production projects, technical stacks, and tenures. Her questions cite real deliverables from your work history rather than generic textbook prompts.
              </p>
            </div>

            <div className="bg-[var(--paper-2)] border border-[var(--line-on-paper)] p-6 rounded-sm space-y-3">
              <div className="w-9 h-9 rounded border border-[var(--brass)] text-[var(--brass)] flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-semibold text-lg text-[var(--text-on-paper)]">2. Dynamic Real-Time Difficulty Scaling</h3>
              <p className="text-sm text-[var(--text-on-paper-mut)] leading-relaxed">
                When a candidate exhibits clear mastery, Aria raises the difficulty to probe architectural limits. If a candidate struggles, she pivots smoothly to examine foundational strengths without penalizing them abruptly.
              </p>
            </div>

            <div className="bg-[var(--paper-2)] border border-[var(--line-on-paper)] p-6 rounded-sm space-y-3">
              <div className="w-9 h-9 rounded border border-[var(--brass)] text-[var(--brass)] flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-semibold text-lg text-[var(--text-on-paper)]">3. Textual Integrity Probing</h3>
              <p className="text-sm text-[var(--text-on-paper-mut)] leading-relaxed">
                When answers resemble copy-pasted documentation or scripted outputs, Aria never accuses. She simply poses a deeply practical follow-up question that only the engineer who built the system could answer.
              </p>
            </div>

            <div className="bg-[var(--paper-2)] border border-[var(--line-on-paper)] p-6 rounded-sm space-y-3">
              <div className="w-9 h-9 rounded border border-[var(--brass)] text-[var(--brass)] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-semibold text-lg text-[var(--text-on-paper)]">4. Two-Strike Integrity Policy</h3>
              <p className="text-sm text-[var(--text-on-paper-mut)] leading-relaxed">
                Aria receives proctoring events (tab switches, webcam absence, paste detection) from the integrity engine. On the first instance she issues a polite reminder; repeat violations pause the session for human recruiter review.
              </p>
            </div>
          </div>
        </div>

        {/* Voice Feature Banner */}
        <div className="bg-[var(--ink)] text-[var(--text-on-ink)] rounded-md p-8 sm:p-12 border border-[var(--line-on-ink)]">
          <div className="max-w-xl space-y-4">
            <div className="kicker">
              <span className="dot"></span>
              MULTI-MODAL AUDIO ENGINE
            </div>
            <h2 className="font-serif text-3xl font-semibold leading-tight text-[var(--text-on-ink)]">
              Talk to Aria naturally, like a human colleague
            </h2>
            <p className="text-sm text-[var(--text-on-ink-mut)] leading-relaxed">
              Technical interviews are dialogues, not written essays. Aria speaks questions aloud and transcribes your microphone responses in real time using Google Gemini multimodal audio.
            </p>
            <div className="pt-2">
              <Link href="/interview" className="btn btn-brass">
                <span>Start voice interview</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

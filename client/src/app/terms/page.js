import Link from "next/link";
import { ShieldAlert, CheckCircle2, FileCheck2, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Terms of Service & Candidate Code of Conduct — Veritas AI",
  description:
    "Review Veritas AI's platform rules, candidate integrity code of conduct, and two-strike policy guidelines.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <main className="pt-32 pb-24" style={{ background: "var(--paper)" }}>
      <div className="wrap max-w-4xl space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="kicker">
            <span className="dot"></span>
            PLATFORM GOVERNANCE &amp; CONDUCT
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--text-on-paper)] leading-tight">
            Terms of Service &amp; Code of Conduct
          </h1>
          <p className="text-sm font-mono text-[var(--text-on-paper-mut)]">
            Effective Date: September 2026 · Version 1.1
          </p>
          <p className="text-base text-[var(--text-on-paper-mut)] leading-relaxed">
            By accessing or taking an interview through Veritas AI, you agree to uphold these terms and our fair evaluation standards. We hold both candidates and hiring organizations to high standards of integrity and mutual respect.
          </p>
        </div>

        {/* 3 Core Rules Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--paper-2)] p-5 rounded border border-[var(--line-on-paper)] space-y-2">
            <div className="w-8 h-8 rounded border border-[var(--brass)] text-[var(--brass)] flex items-center justify-center font-serif text-sm font-semibold">
              01
            </div>
            <h3 className="font-serif font-semibold text-base text-[var(--text-on-paper)]">
              Organic Performance
            </h3>
            <p className="text-xs text-[var(--text-on-paper-mut)] leading-relaxed">
              All responses must reflect your genuine engineering judgment. Generating answers via automated background LLMs or copy-paste feeds violates evaluation integrity.
            </p>
          </div>

          <div className="bg-[var(--paper-2)] p-5 rounded border border-[var(--line-on-paper)] space-y-2">
            <div className="w-8 h-8 rounded border border-[var(--brass)] text-[var(--brass)] flex items-center justify-center font-serif text-sm font-semibold">
              02
            </div>
            <h3 className="font-serif font-semibold text-base text-[var(--text-on-paper)]">
              Two-Strike Policy
            </h3>
            <p className="text-xs text-[var(--text-on-paper-mut)] leading-relaxed">
              Veritas AI enforces a humane two-strike rule. The first irregularity yields an in-character reminder from Aria; only repeat violations trigger session suspension.
            </p>
          </div>

          <div className="bg-[var(--paper-2)] p-5 rounded border border-[var(--line-on-paper)] space-y-2">
            <div className="w-8 h-8 rounded border border-[var(--brass)] text-[var(--brass)] flex items-center justify-center font-serif text-sm font-semibold">
              03
            </div>
            <h3 className="font-serif font-semibold text-base text-[var(--text-on-paper)]">
              Appeal Right
            </h3>
            <p className="text-xs text-[var(--text-on-paper-mut)] leading-relaxed">
              Every candidate may submit an appeal if a technical anomaly (e.g. browser crash, network drop) causes an inadvertent flag. Human recruiters retain final authority.
            </p>
          </div>
        </div>

        {/* Detailed Articles */}
        <div className="space-y-10 border-t border-[var(--line-on-paper)] pt-8 text-sm text-[var(--text-on-paper-mut)] leading-relaxed">
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[var(--text-on-paper)]">
              1. Permitted Use &amp; Account Security
            </h2>
            <p>
              Candidates may use Veritas AI for practice mock sessions or official employer screening invitations. You agree to provide accurate information on your uploaded resume and refrain from prompt-injection attempts intended to override system interview instructions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[var(--text-on-paper)]">
              2. Anti-Cheating &amp; Evaluation Integrity
            </h2>
            <p>
              During an active interview, our proctoring engine tracks window visibility change (tab-switching), large text paste events, and camera presence. Actions deemed dishonest include:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Pasting pre-generated answers or code from external generative AI chat windows.</li>
              <li>Switching tabs repeatedly to research questions during active time blocks.</li>
              <li>Impersonation or third-party proxy test-taking.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[var(--text-on-paper)]">
              3. Recruiter Review &amp; Hiring Decisions
            </h2>
            <p>
              Veritas AI generates objective analytical evaluations, scoring, and transcript summaries to assist recruiters. We do not make automated hiring, firing, or employment denial decisions. All employment outcomes remain solely the decision of the sponsoring human employer.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-serif text-xl font-semibold text-[var(--text-on-paper)]">
              4. Limitation of Liability
            </h2>
            <p>
              Veritas AI provides its service on an &quot;as is&quot; and &quot;as available&quot; basis. We are not liable for incidental or consequential damages resulting from internet connection failures, hardware incompatibility, or employer hiring determinations.
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="pt-6 border-t border-[var(--line-on-paper)] flex items-center justify-between flex-wrap gap-4">
          <Link href="/privacy" className="text-xs font-mono text-[var(--text-on-paper-mut)] hover:text-[var(--brass)]">
            Read Privacy Policy →
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

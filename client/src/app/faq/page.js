"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";

export default function FAQPage() {
  const [openItems, setOpenItems] = useState({});

  const toggle = (key) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const categories = [
    {
      title: "How Aria Works & Interview Format",
      items: [
        {
          q: "What makes Aria different from a traditional coding quiz or puzzle bank?",
          a: "Unlike automated tests that ask puzzle trivia, Aria ingests your actual resume. Over 90% of her questions are derived from your production systems, technologies, and career deliverables. She conducts a natural conversation that adapts in real time based on how deeply you explain your architectural tradeoffs.",
        },
        {
          q: "Can I choose my target role and difficulty level?",
          a: "Yes. In the Profile Review step, you can verify your target role (e.g., Senior Full-Stack Engineer, Backend Engineer, AI Engineer) and choose between Junior, Mid, and Senior difficulty levels, as well as customize target question counts (3, 5, or 7 questions).",
        },
        {
          q: "How long does a typical interview with Aria take?",
          a: "Most interviews take between 12 to 20 minutes depending on answer depth and the selected question count.",
        },
      ],
    },
    {
      title: "Anti-Cheating, Proctoring & Integrity",
      items: [
        {
          q: "What signals does the Anti-Cheating Guardian monitor?",
          a: "Veritas AI monitors three critical integrity signals: browser window blur (switching tabs or windows), clipboard pasting into answer boxes, and webcam presence detection. All processing occurs with minimal invasiveness.",
        },
        {
          q: "What is the two-strike policy?",
          a: "On the first irregularity (e.g. accidental window blur or paste attempt), Aria issues a calm, professional warning in character and reminds you to stay in the window. A repeat violation pauses the interview and queues the session for human recruiter review.",
        },
        {
          q: "What happens if a session terminates due to an accidental browser crash?",
          a: "Veritas AI provides a guaranteed human appeal process. Every event log is timestamped. Human hiring managers can inspect the incident snapshot and click 'Overturn' in their dashboard to reinstate or reschedule your session.",
        },
      ],
    },
    {
      title: "Voice & Audio Interaction",
      items: [
        {
          q: "Do I have to speak aloud, or can I type my answers?",
          a: "You can do both! Aria reads her questions aloud and listens through your microphone, but you can also type your answers into the response box if you are in a noisy environment or prefer typing.",
        },
        {
          q: "What browsers are supported for voice dictation?",
          a: "Veritas AI's HTML5 MediaRecorder voice capture is compatible with Google Chrome, Brave, Mozilla Firefox, Microsoft Edge, and Apple Safari on desktop and modern mobile browsers.",
        },
      ],
    },
    {
      title: "Privacy, Data Retention & Recruiter Access",
      items: [
        {
          q: "How long is my resume and interview transcript stored?",
          a: "By default, all uploaded documents, transcripts, and evaluation scorecards are stored for 90 calendar days, after which they are permanently deleted from PostgreSQL storage.",
        },
        {
          q: "Are webcams recorded or stored on Veritas servers?",
          a: "No. Webcam verification is processed entirely in your local browser client to check presence. No video footage is ever stored or streamed to our servers.",
        },
        {
          q: "Do hiring teams receive the full raw transcript?",
          a: "Hiring teams receive the synthesized scorecard with skill ratings and cited highlights by default. The full transcript is only shared when authorized as part of an official company campaign screening.",
        },
      ],
    },
  ];

  return (
    <main className="pt-32 pb-24" style={{ background: "var(--paper)" }}>
      <div className="wrap max-w-4xl space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="kicker">
            <span className="dot"></span>
            KNOWLEDGE BASE &amp; ANSWERS
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--text-on-paper)] leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-base text-[var(--text-on-paper-mut)] leading-relaxed">
            Everything you need to know about preparing for an interview with Aria, our proctoring rules, and candidate rights.
          </p>
        </div>

        {/* Categories List */}
        <div className="space-y-10">
          {categories.map((cat, cIdx) => (
            <div key={cIdx} className="space-y-4">
              <h2 className="font-serif text-xl font-semibold text-[var(--text-on-paper)] pb-2 border-b border-[var(--line-on-paper)]">
                {cat.title}
              </h2>

              <div className="faq-list">
                {cat.items.map((item, iIdx) => {
                  const key = `${cIdx}-${iIdx}`;
                  const isOpen = !!openItems[key];
                  return (
                    <div key={iIdx} className={`faq-item ${isOpen ? "open" : ""}`}>
                      <button
                        type="button"
                        className="faq-q"
                        onClick={() => toggle(key)}
                        aria-expanded={isOpen}
                      >
                        <span className="text-left font-serif text-[15px] font-medium text-[var(--text-on-paper)]">
                          {item.q}
                        </span>
                        <svg
                          className="chev"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          aria-hidden="true"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </button>
                      <div className="faq-a">
                        <div className="faq-a-inner text-sm text-[var(--text-on-paper-mut)]">
                          {item.a}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA Card */}
        <div className="p-8 rounded-sm bg-[var(--ink)] text-[var(--text-on-ink)] border border-[var(--line-on-ink)] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-serif text-xl font-semibold text-[var(--text-on-ink)]">
              Ready to test your skills with Aria?
            </h3>
            <p className="text-xs text-[var(--text-on-ink-mut)] mt-1">
              Upload your resume and start a tailored practice technical interview in under a minute.
            </p>
          </div>
          <Link href="/interview" className="btn btn-brass btn-sm whitespace-nowrap">
            <span>Start Practice Interview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}

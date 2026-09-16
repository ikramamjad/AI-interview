"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Tilt3D from "@/components/Tilt3D";
import Hero3DBackground from "@/components/Hero3DBackground";
import Scroll3DReveal from "@/components/Scroll3DReveal";

export default function Home() {
  const { openAuthModal } = useAuth();
  const [typedText, setTypedText] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  const fullPrompt =
    "I noticed on your résumé that you architected the event processing pipeline at your previous role. Could you explain how you handled partition rebalancing during sudden traffic spikes?";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullPrompt.length) {
        setTypedText(fullPrompt.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 18);

    return () => clearInterval(interval);
  }, []);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <main id="top">
      {/* 1. HERO WITH 3D QUANTUM ASTROLABE IN THE BACKGROUND & REVERSIBLE SCROLL */}
      <section className="hero grid-3d-stage overflow-visible relative min-h-[720px] flex items-center">
        {/* Colossal 3D Astrolabe Asset Floating in the Background */}
        <Hero3DBackground />

        <div className="wrap hero-grid relative z-10 items-center w-full">
          <div>
            <div className="kicker">
              <span className="dot"></span>
              LIVE VOICE INTERVIEWS · HONEST PROCTORING
            </div>
            <h1>
              <span className="line">
                <span>An interview that</span>
              </span>
              <span className="line">
                <span>actually reads your</span>
              </span>
              <span className="line">
                <span>resume.</span>
              </span>
            </h1>
            <p className="lead" id="heroLead">
              Aria conducts live technical interviews by voice, grounding every question in your real
              projects and adapting to how you answer — then hands you an honest, appealable record
              of the conversation.
            </p>
            <div className="hero-ctas" id="heroCtas">
              <Link href="/interview" className="btn btn-brass btn-3d btn-3d-brass">
                Start your interview
              </Link>
              <a href="#aria" className="btn btn-outline-ink btn-3d">
                See how Aria works
              </a>
            </div>
          </div>

          {/* Frosted Glass 3D Command Deck Floating in Foreground */}
          <Tilt3D maxTilt={10} scale={1.02} glare={true} glareOpacity={0.2} className="w-full">
            <div
              className="panel preserve-3d backdrop-blur-xl bg-[#10121B]/85 border border-[rgba(237,232,218,0.22)] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] rounded-lg overflow-hidden"
              id="heroPanel"
              style={{ margin: 0 }}
            >
              <div className="panel-head layer-z-20 bg-[#161a2b]/80 border-b border-[rgba(237,232,218,0.12)]">
                <span className="sess text-[#D9BC7A] font-mono">SESSION #A0417 — DISTRIBUTED SYSTEMS</span>
                <span className="live flex items-center gap-1.5 text-[#4F7A64] font-mono text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-[#4F7A64] animate-pulse"></span>LIVE RECORDING
                </span>
              </div>
              <div className="panel-body p-5 space-y-4">
                <div className="candidate-row layer-z-30 flex items-center justify-between pb-3 border-b border-[rgba(237,232,218,0.08)]">
                  <div className="flex items-center gap-3">
                    <div className="avatar w-10 h-10 rounded-full bg-gradient-to-br from-[#2b3252] to-[#171b2c] border border-[#b08d3e]/40 flex items-center justify-center font-serif text-sm text-[#d9bc7a] shadow-lg">
                      JP
                    </div>
                    <div className="cand-meta">
                      <div className="cn text-sm font-semibold text-[#ede8da]">Jesse Pinkman</div>
                      <div className="cr text-xs font-mono text-[#9a957f]">Senior Full Stack Engineer</div>
                    </div>
                  </div>
                  <div className="wave flex items-end gap-1 h-5">
                    <span className="w-1 bg-[#4f7a64] h-2 rounded-full animate-[pulse_1s_ease-in-out_infinite]"></span>
                    <span className="w-1 bg-[#4f7a64] h-4 rounded-full animate-[pulse_0.7s_ease-in-out_infinite]"></span>
                    <span className="w-1 bg-[#b08d3e] h-5 rounded-full animate-[pulse_1.2s_ease-in-out_infinite]"></span>
                    <span className="w-1 bg-[#4f7a64] h-3 rounded-full animate-[pulse_0.9s_ease-in-out_infinite]"></span>
                  </div>
                </div>

                <div className="aria-block layer-z-30 relative bg-[#161a2b]/60 p-3.5 rounded-md border border-[rgba(237,232,218,0.1)]">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="who flex items-center gap-2">
                      <span className="aria-name font-semibold text-xs text-[#d9bc7a]">✦ Aria</span>
                      <span className="topic-tag font-mono text-[10px] text-[#9a957f] border border-white/10 px-2 py-0.5 rounded-full">
                        Distributed Systems
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#4f7a64] bg-[#4f7a64]/15 px-2 py-0.5 rounded border border-[#4f7a64]/30">
                      Grounded in Resume
                    </span>
                  </div>
                  <p className="aria-q text-xs leading-relaxed text-[#ede8da]/90 border-l-2 border-[#b08d3e] pl-3 py-0.5">
                    <span className="typed">{typedText}</span>
                    <span className="inline-block w-1.5 h-3.5 bg-[#b08d3e] ml-1 animate-pulse" />
                  </p>
                </div>

                <div className="answer-box layer-z-20 p-2.5 rounded bg-[#10121b]/90 border border-[rgba(237,232,218,0.08)] flex items-center justify-between text-[11px] font-mono text-[#9a957f]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[#ede8da]">Listening via microphone...</span>
                  </div>
                  <span className="text-[#d9bc7a]">0 Strikes Active</span>
                </div>
              </div>
            </div>
          </Tilt3D>
        </div>
      </section>

      {/* 2. WHO IS ARIA / PRINCIPLES (FULLY REVERSIBLE 3D SCROLL REVEAL) */}
      <section id="aria" className="editorial-sec">
        <div className="wrap">
          <Scroll3DReveal direction="up" distance={30} rotateAngle={10} once={false}>
            <div className="sec-head">
              <div className="sec-rule"></div>
              <h2>Built to interview, not to trick you</h2>
              <p>Aria's questions come from your resume, not a puzzle bank. Here's the shape of every session.</p>
            </div>
          </Scroll3DReveal>

          <div className="principles">
            <Scroll3DReveal direction="up" delay={0} distance={60} rotateAngle={16} once={false} className="h-full">
              <Tilt3D maxTilt={10} scale={1.02} className="h-full">
                <div className="principle principle-3d h-full preserve-3d">
                  <div className="layer-z-30">
                    <svg className="p-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M9 3a3 3 0 0 0-3 3v1a3 3 0 0 0-2 2.8V13a3 3 0 0 0 2 2.8V17a3 3 0 0 0 3 3" />
                      <path d="M15 3a3 3 0 0 1 3 3v1a3 3 0 0 1 2 2.8V13a3 3 0 0 1-2 2.8V17a3 3 0 0 1-3 3" />
                      <path d="M9 8h.01M9 12h.01M9 16h.01M15 8h.01M15 12h.01M15 16h.01" />
                    </svg>
                  </div>
                  <h3 className="layer-z-20">Grounded in your resume</h3>
                  <p className="layer-z-10">
                    More than nine in ten questions are built from your actual projects and technologies — no trivia dumps, no algorithm puzzles you'd never use on the job.
                  </p>
                </div>
              </Tilt3D>
            </Scroll3DReveal>

            <Scroll3DReveal direction="up" delay={140} distance={60} rotateAngle={16} once={false} className="h-full">
              <Tilt3D maxTilt={10} scale={1.02} className="h-full">
                <div className="principle principle-3d h-full preserve-3d">
                  <div className="layer-z-30">
                    <svg className="p-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <rect x="9" y="2" width="6" height="12" rx="3" />
                      <path d="M5 11a7 7 0 0 0 14 0" />
                      <path d="M12 18v4M8 22h8" />
                    </svg>
                  </div>
                  <h3 className="layer-z-20">A real conversation, spoken aloud</h3>
                  <p className="layer-z-10">
                    Aria asks her questions in a natural voice and listens to your spoken answers live, through your microphone — no typing required.
                  </p>
                </div>
              </Tilt3D>
            </Scroll3DReveal>

            <Scroll3DReveal direction="up" delay={280} distance={60} rotateAngle={16} once={false} className="h-full">
              <Tilt3D maxTilt={10} scale={1.02} className="h-full">
                <div className="principle principle-3d h-full preserve-3d">
                  <div className="layer-z-30">
                    <svg className="p-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                      <path d="M4 21V13M4 9V3M12 21v-7M12 10V3M20 21v-4M20 13V3" />
                      <path d="M1 13h6M9 10h6M17 13h6" />
                    </svg>
                  </div>
                  <h3 className="layer-z-20">Depth that follows your answers</h3>
                  <p className="layer-z-10">
                    Show real mastery and Aria goes deeper. Get stuck, and she pivots gracefully to give your core skills room to show.
                  </p>
                </div>
              </Tilt3D>
            </Scroll3DReveal>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (3D LASER CONDUIT & REVERSIBLE STAGGERED STEPS) */}
      <section id="how" className="editorial-sec relative" style={{ background: "var(--paper-2)" }}>
        <div className="wrap">
          <Scroll3DReveal direction="up" distance={30} rotateAngle={8} once={false}>
            <div className="sec-head">
              <div className="sec-rule"></div>
              <h2>From resume to finished interview in fifteen minutes</h2>
              <p>Three steps, each designed to keep the process fast and fair.</p>
            </div>
          </Scroll3DReveal>

          <div className="steps relative">
            {/* 3D Glowing Connecting Laser Conduit */}
            <div className="conduit-line-3d hidden md:block" />

            <Scroll3DReveal direction="up" delay={0} distance={50} rotateAngle={14} once={false} className="h-full relative z-10">
              <Tilt3D maxTilt={9} scale={1.02} className="h-full">
                <div className="step step-card-3d h-full preserve-3d">
                  <div className="step-num layer-z-30">01</div>
                  <h3 className="layer-z-20">Upload &amp; extract</h3>
                  <p className="layer-z-10">
                    Drop in a PDF or Word résumé. Our document handling filters out hidden instructions before reading it, then pulls out your skills, roles, and key projects.
                  </p>
                </div>
              </Tilt3D>
            </Scroll3DReveal>

            <Scroll3DReveal direction="up" delay={150} distance={50} rotateAngle={14} once={false} className="h-full relative z-10">
              <Tilt3D maxTilt={9} scale={1.02} className="h-full">
                <div className="step step-card-3d h-full preserve-3d">
                  <div className="step-num layer-z-30">02</div>
                  <h3 className="layer-z-20">Interview with Aria</h3>
                  <p className="layer-z-10">
                    Review your profile, choose a difficulty, and step into the room. Aria asks, you reply by voice or text, and the conversation adjusts as you go.
                  </p>
                </div>
              </Tilt3D>
            </Scroll3DReveal>

            <Scroll3DReveal direction="up" delay={300} distance={50} rotateAngle={14} once={false} className="h-full relative z-10">
              <Tilt3D maxTilt={9} scale={1.02} className="h-full">
                <div className="step step-card-3d h-full preserve-3d">
                  <div className="step-num layer-z-30">03</div>
                  <h3 className="layer-z-20">Integrity &amp; scorecard</h3>
                  <p className="layer-z-10">
                    A two-strike honesty check runs quietly throughout. When you finish, an AI-written report summarizes your technical strengths and hiring signals.
                  </p>
                </div>
              </Tilt3D>
            </Scroll3DReveal>
          </div>

          <div className="steps-cta">
            <Link href="/interview" className="btn btn-outline-paper btn-3d">
              Try a sample interview
            </Link>
          </div>
        </div>
      </section>

      {/* 4. TRUST / PROCTORING (3D COMMAND CONSOLE WITH ACTIVE SCANLINE - REVERSIBLE) */}
      <section id="trust" className="editorial-sec sec-on-ink grid-3d-stage">
        <div className="grid-3d-floor" style={{ opacity: 0.55 }}></div>
        <div className="wrap trust-grid relative z-10">
          <div>
            <Scroll3DReveal direction="left" distance={30} once={false}>
              <div className="sec-head" style={{ marginBottom: 0 }}>
                <div className="sec-rule"></div>
                <h2>Honest proctoring, not surveillance</h2>
                <p>Aria watches for the signs that matter and stays out of the way for everything else.</p>
              </div>
            </Scroll3DReveal>

            <div className="trust-list">
              <Scroll3DReveal direction="left" delay={0} distance={40} once={false}>
                <div className="trust-item">
                  <span className="num">01</span>
                  <div>
                    <h4>A two-strike policy before any flag</h4>
                    <p>One irregular moment doesn't end your session — Aria distinguishes a stumble from a pattern.</p>
                  </div>
                </div>
              </Scroll3DReveal>

              <Scroll3DReveal direction="left" delay={120} distance={40} once={false}>
                <div className="trust-item">
                  <span className="num">02</span>
                  <div>
                    <h4>A person reviews before any termination</h4>
                    <p>No session ends on an automated decision alone. A human checks the record first.</p>
                  </div>
                </div>
              </Scroll3DReveal>

              <Scroll3DReveal direction="left" delay={240} distance={40} once={false}>
                <div className="trust-item">
                  <span className="num">03</span>
                  <div>
                    <h4>Every candidate can appeal</h4>
                    <p>If a session is flagged in error, you can contest it and have the record reviewed.</p>
                  </div>
                </div>
              </Scroll3DReveal>
            </div>
          </div>

          {/* Integrity Guardian Terminal Card with Active 3D Scanline */}
          <Scroll3DReveal direction="right" delay={150} distance={60} rotateAngle={16} once={false} className="w-full">
            <Tilt3D maxTilt={10} scale={1.02} glare={true} glareOpacity={0.22} className="w-full">
              <div className="relative bg-[#1A1E30] rounded border border-[rgba(237,232,218,0.14)] p-6 shadow-2xl space-y-5 text-[#EDE8DA] card-3d-dark preserve-3d overflow-hidden">
                {/* 3D Holographic Vertical Scanline Laser */}
                <div className="scanline-overlay" />

                <div className="flex items-center justify-between pb-3 border-b border-[rgba(237,232,218,0.1)] layer-z-20">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4F7A64] shadow-[0_0_8px_rgba(79,122,100,0.6)] animate-pulse"></span>
                    <span className="font-mono text-xs text-[#D9BC7A] font-medium tracking-wide">
                      INTEGRITY AUDIT · ACTIVE
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#9A957F] border border-[rgba(237,232,218,0.14)] px-2 py-0.5 rounded">
                    SESSION #A0417
                  </span>
                </div>

                {/* Signals Matrix */}
                <div className="space-y-2.5 layer-z-20">
                  <div className="flex items-center justify-between p-3 rounded bg-[#10121B] border border-[rgba(237,232,218,0.08)] shadow-inner">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-[#EDE8DA]">Webcam Focus</div>
                      <div className="font-mono text-[10px] text-[#9A957F]">Single subject in frame · Client-side only</div>
                    </div>
                    <span className="font-mono text-[10px] text-[#4F7A64] bg-[#4F7A64]/15 px-2 py-0.5 rounded border border-[#4F7A64]/30 shadow-xs">
                      OPTIMAL
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded bg-[#10121B] border border-[rgba(237,232,218,0.08)] shadow-inner">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-[#EDE8DA]">Window Focus</div>
                      <div className="font-mono text-[10px] text-[#9A957F]">0 tab switches · Active window retained</div>
                    </div>
                    <span className="font-mono text-[10px] text-[#4F7A64] bg-[#4F7A64]/15 px-2 py-0.5 rounded border border-[#4F7A64]/30 shadow-xs">
                      VERIFIED
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded bg-[#10121B] border border-[rgba(237,232,218,0.08)] shadow-inner">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-[#EDE8DA]">Input Cadence</div>
                      <div className="font-mono text-[10px] text-[#9A957F]">Organic speech stream · 0 paste triggers</div>
                    </div>
                    <span className="font-mono text-[10px] text-[#4F7A64] bg-[#4F7A64]/15 px-2 py-0.5 rounded border border-[#4F7A64]/30 shadow-xs">
                      NATURAL
                    </span>
                  </div>
                </div>

                {/* Two Strike Policy Gauge */}
                <div className="pt-2 border-t border-[rgba(237,232,218,0.08)] layer-z-20">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#9A957F] mb-2">
                    <span>TWO-STRIKE PROTOCOL</span>
                    <span className="text-[#D9BC7A]">0 / 2 STRIKES</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-[#10121B] border border-[#4F7A64]/40 text-center shadow-xs">
                      <div className="font-mono text-[10px] text-[#4F7A64] font-semibold">STRIKE 1: BUFFER</div>
                      <div className="text-[10px] text-[#9A957F]">Calm In-Character Reminder</div>
                    </div>
                    <div className="p-2 rounded bg-[#10121B] border border-[rgba(237,232,218,0.1)] text-center shadow-xs">
                      <div className="font-mono text-[10px] text-[#9A957F] font-semibold">STRIKE 2: ESCALATION</div>
                      <div className="text-[10px] text-[#9A957F]">Human Recruiter Review</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#9A957F] pt-1 layer-z-10">
                  <span>🔒 Zero raw video stored</span>
                  <span className="text-[#D9BC7A]">Appeal guarantee active</span>
                </div>
              </div>
            </Tilt3D>
          </Scroll3DReveal>
        </div>
      </section>

      {/* 5. FAQ (FULLY REVERSIBLE 3D SCROLL CASCADE) */}
      <section id="faq" className="editorial-sec">
        <div className="wrap">
          <Scroll3DReveal direction="up" distance={30} rotateAngle={10} once={false}>
            <div className="sec-head">
              <div className="sec-rule"></div>
              <h2>Frequently asked questions</h2>
              <p>Everything candidates ask about Aria, proctoring rules, and appeal rights.</p>
            </div>
          </Scroll3DReveal>

          <div className="faq-list">
            <Scroll3DReveal direction="up" delay={0} distance={30} rotateAngle={8} once={false}>
              <div className={`faq-item ${openFaq === 0 ? "open" : ""}`}>
                <button type="button" className="faq-q" onClick={() => toggleFaq(0)}>
                  <span>What is Aria and how does she conduct interviews?</span>
                  <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
                <div className="faq-a">
                  <div className="faq-a-inner">
                    Aria is Veritas AI's interviewer. She reads your résumé, asks questions aloud about your real projects, listens to your spoken answers, and adjusts difficulty as the conversation develops.
                  </div>
                </div>
              </div>
            </Scroll3DReveal>

            <Scroll3DReveal direction="up" delay={80} distance={30} rotateAngle={8} once={false}>
              <div className={`faq-item ${openFaq === 1 ? "open" : ""}`}>
                <button type="button" className="faq-q" onClick={() => toggleFaq(1)}>
                  <span>Can a candidate appeal an accidental termination?</span>
                  <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
                <div className="faq-a">
                  <div className="faq-a-inner">
                    Yes. Every session follows a two-strike policy and requires human review before it can end early. If you believe a flag was made in error, you can request a review of the full record.
                  </div>
                </div>
              </div>
            </Scroll3DReveal>

            <Scroll3DReveal direction="up" delay={160} distance={30} rotateAngle={8} once={false}>
              <div className={`faq-item ${openFaq === 2 ? "open" : ""}`}>
                <button type="button" className="faq-q" onClick={() => toggleFaq(2)}>
                  <span>How long is my résumé and interview data kept?</span>
                  <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
                <div className="faq-a">
                  <div className="faq-a-inner">
                    Interview records and uploaded documents are retained for 90 days, after which they're deleted automatically unless you or the hiring team request otherwise.
                  </div>
                </div>
              </div>
            </Scroll3DReveal>

            <Scroll3DReveal direction="up" delay={240} distance={30} rotateAngle={8} once={false}>
              <div className={`faq-item ${openFaq === 3 ? "open" : ""}`}>
                <button type="button" className="faq-q" onClick={() => toggleFaq(3)}>
                  <span>Do hiring teams see my raw answers or just the scorecard?</span>
                  <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
                <div className="faq-a">
                  <div className="faq-a-inner">
                    Hiring teams receive the AI-written scorecard by default. The full transcript is only shared if you consent to it during setup.
                  </div>
                </div>
              </div>
            </Scroll3DReveal>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA (FULLY REVERSIBLE 3D ZOOM REVEAL) */}
      <section className="final-cta relative overflow-hidden grid-3d-stage">
        <div className="grid-3d-floor" style={{ opacity: 0.4 }}></div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(176,141,62,0.12), transparent 75%)",
          }}
        />
        <Scroll3DReveal direction="zoom" delay={100} duration={850} once={false}>
          <div className="wrap final-cta-inner relative z-10">
            <div className="kicker justify-center mb-4">
              <span className="dot"></span>
              ZERO SCHEDULING FRICTION
            </div>
            <h2>Your next interview could start in five minutes.</h2>
            <p>
              Upload a résumé and Aria will calibrate a tailored technical interview ready before your coffee&apos;s done.
            </p>

            {/* 5-minute pipeline badges with 3D bevel */}
            <div className="mt-8 mb-2 flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-[#D9BC7A]">
              <span className="px-3 py-1.5 rounded bg-[#1A1E30] border border-[rgba(237,232,218,0.14)] shadow-sm">
                01 Upload Resume (10s)
              </span>
              <span className="text-[#9A957F] hidden sm:inline">→</span>
              <span className="px-3 py-1.5 rounded bg-[#1A1E30] border border-[rgba(237,232,218,0.14)] shadow-sm">
                02 Aria Calibration (30s)
              </span>
              <span className="text-[#9A957F] hidden sm:inline">→</span>
              <span className="px-3 py-1.5 rounded bg-[#1A1E30] border border-[rgba(237,232,218,0.14)] shadow-sm">
                03 Voice Q&amp;A (15m)
              </span>
              <span className="text-[#9A957F] hidden sm:inline">→</span>
              <span className="px-3 py-1.5 rounded bg-[#1A1E30] border border-[rgba(237,232,218,0.14)] shadow-sm">
                04 Detailed Scorecard
              </span>
            </div>

            <div className="ctas">
              <Link href="/interview" className="btn btn-brass btn-3d btn-3d-brass">
                Start free interview
              </Link>
              <button
                type="button"
                onClick={() => openAuthModal("signup")}
                className="btn btn-outline-ink btn-3d"
              >
                Create an account
              </button>
            </div>
          </div>
        </Scroll3DReveal>
      </section>
    </main>
  );
}

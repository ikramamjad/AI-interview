"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Aria3DOrb from "./Aria3DOrb";

/**
 * Hero3DStage - Monumental 3D Interactive Centerpiece Asset for Aria
 * Features:
 * - 3D Quantum Astrolabe Gyroscope Core with raytraced reflections & depth
 * - Real-time pointer parallax with smooth spring damping
 * - Scroll-linked 3D orbital rotation & spatial perspective recession
 * - Interactive WebGL 3D particle & orbital mode toggle
 * - Floating glassmorphic 3D HUD telemetry chips with translateZ extrusion
 * - Dynamic audio-reactive soundwave visualizer & typed question terminal
 */
export default function Hero3DStage({ typedText }) {
  const containerRef = useRef(null);
  const [viewMode, setViewMode] = useState("hologram"); // "hologram" | "webgl"
  const [transform, setTransform] = useState({
    rotateX: 4,
    rotateY: -6,
    scale: 1,
    glareX: 50,
    glareY: 50,
  });
  const [scrollY, setScrollY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const rafId = useRef(null);

  // Scroll tracking with RAF
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) * 2 - 1; // -1 to +1
    const normY = (y / rect.height) * 2 - 1; // -1 to +1

    const maxTilt = 12;
    const targetRotX = -normY * maxTilt;
    const targetRotY = normX * maxTilt;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      setTransform({
        rotateX: targetRotX,
        rotateY: targetRotY,
        scale: 1.02,
        glareX: (x / rect.width) * 100,
        glareY: (y / rect.height) * 100,
      });
    });
  }, []);

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      setTransform({
        rotateX: 3,
        rotateY: -5,
        scale: 1,
        glareX: 50,
        glareY: 50,
      });
    });
  }, []);

  const handleCoreClick = () => {
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 900);
  };

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Compute scroll physics values
  const clampedScroll = Math.min(scrollY, 700);
  const scrollRotateX = clampedScroll * 0.035;
  const scrollRotateY = clampedScroll * 0.08;
  const scrollTranslateY = clampedScroll * 0.16;
  const scrollTranslateZ = -clampedScroll * 0.12;
  const scrollChip1Y = -clampedScroll * 0.22;
  const scrollChip2X = clampedScroll * 0.18;
  const scrollChip3Z = clampedScroll * 0.06;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[560px] mx-auto select-none"
      style={{
        perspective: "1400px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* 3D Tilted Spatial Deck with Scroll Physics */}
      <div
        className="relative w-full transition-transform duration-100 ease-out"
        style={{
          transform: `translate3d(0, ${scrollTranslateY.toFixed(1)}px, ${scrollTranslateZ.toFixed(
            1
          )}px) rotateX(${(transform.rotateX + scrollRotateX).toFixed(2)}deg) rotateY(${(
            transform.rotateY + scrollRotateY
          ).toFixed(2)}deg) scale3d(${transform.scale}, ${transform.scale}, ${transform.scale})`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Volumetric Radial Backlight Halo */}
        <div
          className="absolute -inset-10 pointer-events-none rounded-full blur-3xl opacity-60 transition-opacity duration-500"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(176,141,62,0.35) 0%, rgba(79,122,100,0.2) 45%, transparent 75%)",
            transform: "translateZ(-40px)",
          }}
        />

        {/* 3D Perspective Ground Shadow Pedestal */}
        <div
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-4/5 h-20 bg-black/70 rounded-full blur-xl pointer-events-none"
          style={{
            transform: "rotateX(75deg) translateZ(-60px)",
          }}
        />

        {/* Main 3D Asset Enclosure */}
        <div
          onClick={handleCoreClick}
          className={`relative w-full aspect-square rounded-2xl overflow-hidden border border-[rgba(237,232,218,0.18)] bg-gradient-to-b from-[#161a2b] via-[#0d0f18] to-[#080910] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] cursor-pointer ${
            isPulsing ? "ring-2 ring-[#d9bc7a]" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
          }}
          title="Click to trigger quantum core pulse"
        >
          {/* Dynamic Specular Light Glare Sheen */}
          <div
            className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${transform.glareX}% ${transform.glareY}%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 65%)`,
              opacity: isHovered ? 1 : 0.4,
            }}
          />

          {/* Asset View: Cinematic Render vs WebGL Interactive Mode */}
          {viewMode === "hologram" ? (
            <div className="relative w-full h-full flex items-center justify-center p-3">
              <Image
                src="/aria-3d-hero.jpg"
                alt="Aria 3D Quantum Astrolabe Core"
                width={700}
                height={700}
                priority
                className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)] scale-105 transition-transform duration-700 hover:scale-110"
              />

              {/* Gentle Floating Atmospheric Fog */}
              <div
                className="absolute inset-0 pointer-events-none mix-blend-screen opacity-30"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(217,188,122,0.4) 0%, transparent 60%)",
                }}
              />
            </div>
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#0d0f18]">
              <Aria3DOrb size={360} isSpeaking={true} interactive={true} />
              <div className="absolute bottom-4 font-mono text-[11px] text-[#D9BC7A] bg-black/60 px-3 py-1 rounded border border-white/10 pointer-events-none">
                360° Real-time WebGL Orbital Physics
              </div>
            </div>
          )}

          {/* Interactive Mode Switcher Pill */}
          <div
            className="absolute top-4 right-4 z-30 flex items-center bg-[#10121B]/90 backdrop-blur-md border border-[rgba(237,232,218,0.2)] rounded-full p-1 text-[11px] font-mono shadow-lg"
            onClick={(e) => e.stopPropagation()}
            style={{ transform: "translateZ(35px)" }}
          >
            <button
              type="button"
              onClick={() => setViewMode("hologram")}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                viewMode === "hologram"
                  ? "bg-[#B08D3E] text-[#10121B] shadow-sm"
                  : "text-[#EDE8DA]/70 hover:text-white"
              }`}
            >
              3D CORE
            </button>
            <button
              type="button"
              onClick={() => setViewMode("webgl")}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                viewMode === "webgl"
                  ? "bg-[#4F7A64] text-white shadow-sm"
                  : "text-[#EDE8DA]/70 hover:text-white"
              }`}
            >
              WEBGL GYRO
            </button>
          </div>

          {/* Click to Pulse Indicator */}
          <div
            className="absolute top-4 left-4 z-30 pointer-events-none font-mono text-[10px] text-[#D9BC7A] bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-[#B08D3E]/30 flex items-center gap-1.5 shadow-sm"
            style={{ transform: "translateZ(30px)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F7A64] animate-ping" />
            <span>INTERACTIVE 3D ASSET</span>
          </div>
        </div>

        {/* ================================================================= */}
        {/* MULTI-LAYER 3D FLOATING TELEMETRY CHIPS (translateZ Parallax)   */}
        {/* ================================================================= */}

        {/* Floating Chip 1: Top Left - Active Session Badge */}
        <div
          className="absolute -top-5 -left-4 sm:-left-6 z-40 bg-[#1A1E30]/95 backdrop-blur-md border border-[#B08D3E]/40 rounded-md px-3.5 py-2 text-[#EDE8DA] shadow-[0_12px_28px_rgba(0,0,0,0.5)] flex items-center gap-2.5 pointer-events-none"
          style={{
            transform: `translate3d(0, ${scrollChip1Y.toFixed(1)}px, 55px)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          <div className="w-2 h-2 rounded-full bg-[#4F7A64] shadow-[0_0_8px_#4F7A64] animate-pulse" />
          <div className="font-mono text-[11px] leading-tight">
            <div className="text-[#D9BC7A] font-bold">SESSION #A0417</div>
            <div className="text-[9px] text-[#9A957F]">DISTRIBUTED SYSTEMS · LIVE</div>
          </div>
        </div>

        {/* Floating Chip 2: Top Right - Voice Neural Synthesis Spectrum */}
        <div
          className="absolute top-16 -right-3 sm:-right-6 z-40 bg-[#1A1E30]/95 backdrop-blur-md border border-[rgba(237,232,218,0.2)] rounded-md px-3 py-2 shadow-[0_12px_28px_rgba(0,0,0,0.5)] pointer-events-none hidden sm:flex items-center gap-2"
          style={{
            transform: `translate3d(${scrollChip2X.toFixed(1)}px, 0, 45px)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          <div className="font-mono text-[10px] text-[#D9BC7A]">VOICE SYNTHESIS</div>
          {/* Animated Audio Spectrum Bars */}
          <div className="flex items-end gap-0.5 h-4">
            <span className="w-1 bg-[#B08D3E] rounded-full animate-[pulse_1.1s_ease-in-out_infinite] h-2" />
            <span className="w-1 bg-[#B08D3E] rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-4" />
            <span className="w-1 bg-[#4F7A64] rounded-full animate-[pulse_1.3s_ease-in-out_infinite] h-3" />
            <span className="w-1 bg-[#B08D3E] rounded-full animate-[pulse_0.9s_ease-in-out_infinite] h-4" />
            <span className="w-1 bg-[#4F7A64] rounded-full animate-[pulse_1.2s_ease-in-out_infinite] h-2" />
          </div>
        </div>

        {/* Floating Chip 3: Bottom Full Overlay - The Live Technical Interview Console */}
        <div
          className="relative -mt-16 sm:-mt-20 z-40 mx-2 sm:mx-4 bg-[#10121B]/95 backdrop-blur-md border border-[rgba(237,232,218,0.18)] rounded-lg p-4 sm:p-5 shadow-[0_20px_45px_rgba(0,0,0,0.7)] text-[#EDE8DA] space-y-3"
          style={{
            transform: `translate3d(0, 0, ${(65 + scrollChip3Z).toFixed(1)}px)`,
            transition: "transform 0.1s ease-out",
          }}
        >
          {/* Candidate Row */}
          <div className="flex items-center justify-between border-b border-[rgba(237,232,218,0.1)] pb-2.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2B3252] to-[#171B2C] border border-[#B08D3E]/40 flex items-center justify-center font-serif text-sm font-bold text-[#D9BC7A] shadow-md">
                JP
              </div>
              <div>
                <div className="text-xs font-semibold text-[#EDE8DA]">Jesse Pinkman</div>
                <div className="text-[10px] font-mono text-[#9A957F]">Senior Full Stack Engineer</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#4F7A64]/20 border border-[#4F7A64]/40 font-mono text-[9px] text-[#4F7A64]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4F7A64] animate-pulse" />
              <span>LIVE INTERVIEW</span>
            </div>
          </div>

          {/* Aria Typed Question Terminal */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#D9BC7A] font-bold flex items-center gap-1">
                <span>✦</span> Aria (Staff AI Interviewer)
              </span>
              <span className="text-[#9A957F] text-[10px] border border-white/10 px-1.5 py-0.5 rounded">
                Grounded in Resume
              </span>
            </div>
            <p className="text-xs sm:text-[13px] leading-relaxed text-[#EDE8DA]/90 border-l-2 border-[#B08D3E] pl-3 py-0.5 min-h-[44px]">
              <span className="font-sans">{typedText}</span>
              <span className="inline-block w-1.5 h-3.5 bg-[#B08D3E] ml-1 animate-pulse" />
            </p>
          </div>

          {/* Candidate Voice Prompt */}
          <div className="flex items-center justify-between p-2.5 rounded bg-[#1A1E30] border border-[rgba(237,232,218,0.08)] text-[11px] font-mono text-[#9A957F]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-[#EDE8DA]">Listening via microphone...</span>
            </div>
            <span className="text-[#D9BC7A]">0 Strikes Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

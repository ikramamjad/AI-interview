"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Aria3DOrb from "./Aria3DOrb";

/**
 * Hero3DBackground - Pure 3D WebGL Hologram in the Hero Background
 * 100% code-driven WebGL 3D math & geometry (NO static picture):
 * - Real-time Three.js rotating brass astrolabe rings & crystalline core
 * - Reversible continuous scroll parallax (rotates & shifts on scroll up/down)
 * - Mouse cursor 3D perspective tracking
 * - Volumetric golden & emerald ambient light aura
 * - Reversible 3D perspective floor grid with scroll velocity
 */
export default function Hero3DBackground() {
  const [scrollY, setScrollY] = useState(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const rafId = useRef(null);

  // Reversible scroll listener
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Global mouse parallax listener
  const handlePointerMove = useCallback((e) => {
    const normX = (e.clientX / window.innerWidth) * 2 - 1; // -1 to 1
    const normY = (e.clientY / window.innerHeight) * 2 - 1; // -1 to 1

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      setMouseOffset({
        x: normX * 14,
        y: normY * 12,
      });
    });
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [handlePointerMove]);

  // Continuous reversible scroll transformations
  const clampedScroll = Math.min(scrollY, 900);
  const scrollRotY = clampedScroll * 0.12; // Rotates on scroll down, reverses on scroll up
  const scrollRotX = clampedScroll * 0.05;
  const scrollTranslateY = clampedScroll * 0.22;
  const scrollTranslateZ = -clampedScroll * 0.15;
  const gridOffsetY = clampedScroll * 0.5;

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
      style={{
        perspective: "1200px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* 1. Dynamic 3D Perspective Grid Floor (moves with scroll up and down) */}
      <div
        className="absolute -bottom-16 -left-[30%] -right-[30%] h-[340px] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(176, 141, 62, 0.14) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(176, 141, 62, 0.14) 1px, transparent 1px)
          `,
          backgroundSize: "44px 44px",
          backgroundPositionY: `${gridOffsetY}px`, // Reversible continuous scroll movement
          transform: "perspective(450px) rotateX(68deg)",
          transformOrigin: "50% 100%",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 60%, black 20%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 60%, black 20%, transparent 80%)",
          zIndex: 1,
        }}
      />

      {/* 2. Deep Volumetric Ambient Glow Behind the 3D Asset */}
      <div
        className="absolute top-1/2 right-[8%] sm:right-[14%] -translate-y-1/2 w-[650px] h-[650px] rounded-full blur-3xl opacity-75 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(176, 141, 62, 0.28) 0%, rgba(79, 122, 100, 0.18) 42%, transparent 70%)",
          transform: `translate3d(${mouseOffset.x * 0.5}px, ${
            scrollTranslateY * 0.7 - mouseOffset.y * 0.5
          }px, -100px)`,
          transition: "transform 0.15s ease-out",
        }}
      />

      {/* 3. Pure Real-Time WebGL 3D Hologram Astrolabe (NO STATIC PICTURE) */}
      <div
        className="absolute top-[6%] sm:top-[4%] right-[-5%] sm:right-[2%] lg:right-[6%] w-[500px] sm:w-[600px] lg:w-[680px] aspect-square flex items-center justify-center pointer-events-none"
        style={{
          transform: `translate3d(${mouseOffset.x.toFixed(1)}px, ${(
            scrollTranslateY - mouseOffset.y
          ).toFixed(1)}px, ${scrollTranslateZ.toFixed(1)}px) rotateX(${(
            -mouseOffset.y * 0.7 + scrollRotX
          ).toFixed(2)}deg) rotateY(${(
            mouseOffset.x * 0.7 + scrollRotY
          ).toFixed(2)}deg)`,
          transformStyle: "preserve-3d",
          transition: "transform 0.1s ease-out",
          filter: "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.7))",
        }}
      >
        <Aria3DOrb size={520} isSpeaking={true} interactive={true} />

        {/* Ambient Holographic Orbital Rings */}
        <div
          className="absolute inset-2 rounded-full border border-[#B08D3E]/15 animate-[spin_40s_linear_infinite] pointer-events-none"
          style={{ transform: "rotateX(65deg)" }}
        />
        <div
          className="absolute inset-12 rounded-full border border-[#4F7A64]/20 animate-[spin_28s_linear_infinite_reverse] pointer-events-none"
          style={{ transform: "rotateY(55deg)" }}
        />
      </div>
    </div>
  );
}

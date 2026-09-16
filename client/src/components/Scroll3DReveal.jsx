"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll3DReveal - Fully Reversible 3D Spatial Scroll Reveal Wrapper
 * Uses IntersectionObserver to trigger 3D perspective transforms in BOTH directions:
 * elements fly in along the Z-axis when scrolled into view, and smoothly tilt/recede
 * when scrolled out, providing continuous, fully reversible scroll animations.
 */
export default function Scroll3DReveal({
  children,
  className = "",
  style = {},
  direction = "up", // "up" | "down" | "left" | "right" | "zoom"
  distance = 50,
  rotateAngle = 18,
  depth = -80,
  duration = 750,
  delay = 0,
  threshold = 0.12,
  once = false, // REVERSIBLE by default: animates on every scroll!
}) {
  const domRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = domRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(node);
        } else {
          // Scrolled out of view -> reverse animation!
          if (!once) {
            setIsVisible(false);
          }
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, once]);

  // Compute 3D initial/exit transform
  const getInitialTransform = () => {
    switch (direction) {
      case "up":
        return `perspective(1000px) translateY(${distance}px) translateZ(${depth}px) rotateX(${rotateAngle}deg)`;
      case "down":
        return `perspective(1000px) translateY(-${distance}px) translateZ(${depth}px) rotateX(-${rotateAngle}deg)`;
      case "left":
        return `perspective(1000px) translateX(${distance}px) translateZ(${depth}px) rotateY(-${rotateAngle}deg)`;
      case "right":
        return `perspective(1000px) translateX(-${distance}px) translateZ(${depth}px) rotateY(${rotateAngle}deg)`;
      case "zoom":
        return `perspective(1000px) translateZ(${depth * 1.8}px) scale(0.85)`;
      default:
        return `perspective(1000px) translateY(${distance}px) translateZ(${depth}px)`;
    }
  };

  return (
    <div
      ref={domRef}
      className={`scroll-3d-reveal ${className}`}
      style={{
        transform: isVisible
          ? "perspective(1000px) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1)"
          : getInitialTransform(),
        opacity: isVisible ? 1 : 0,
        filter: isVisible ? "blur(0px)" : "blur(4px)",
        transition: `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) ${
          isVisible ? delay : 0
        }ms, opacity ${duration * 0.75}ms ease-out ${
          isVisible ? delay : 0
        }ms, filter ${duration * 0.75}ms ease-out ${isVisible ? delay : 0}ms`,
        transformStyle: "preserve-3d",
        willChange: "transform, opacity, filter",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

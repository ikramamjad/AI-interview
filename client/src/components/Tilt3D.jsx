"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/**
 * Tilt3D - Premium 3D Perspective Tilt & Specular Lighting Container
 * Provides realistic hardware-accelerated 3D mouse tracking,
 * perspective depth, preserve-3d child layer extrusion (translateZ),
 * and dynamic specular light sheen.
 */
export default function Tilt3D({
  children,
  className = "",
  style = {},
  maxTilt = 10,
  perspective = 1000,
  scale = 1.02,
  glare = true,
  glareOpacity = 0.16,
  resetOnLeave = true,
  initialTilt = null, // e.g. { x: 3, y: -4 }
}) {
  const containerRef = useRef(null);
  const [transform, setTransform] = useState({
    rotateX: initialTilt ? initialTilt.x : 0,
    rotateY: initialTilt ? initialTilt.y : 0,
    scale: 1,
    glareX: 50,
    glareY: 50,
    glareAlpha: 0,
  });
  const [isHovered, setIsHovered] = useState(false);
  const rafId = useRef(null);

  const handleMouseMove = useCallback(
    (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const normX = (x / rect.width) * 2 - 1; // -1 to +1
      const normY = (y / rect.height) * 2 - 1; // -1 to +1

      const targetRotX = -normY * maxTilt;
      const targetRotY = normX * maxTilt;

      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;

      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        setTransform({
          rotateX: targetRotX,
          rotateY: targetRotY,
          scale: scale,
          glareX,
          glareY,
          glareAlpha: glareOpacity,
        });
      });
    },
    [maxTilt, scale, glareOpacity]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      setTransform({
        rotateX: initialTilt ? initialTilt.x : 0,
        rotateY: initialTilt ? initialTilt.y : 0,
        scale: 1,
        glareX: 50,
        glareY: 50,
        glareAlpha: 0,
      });
    });
  }, [initialTilt]);

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`tilt-3d-stage ${className}`}
      style={{
        perspective: `${perspective}px`,
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      <div
        className="tilt-3d-card"
        style={{
          transform: `perspective(${perspective}px) rotateX(${transform.rotateX.toFixed(
            2
          )}deg) rotateY(${transform.rotateY.toFixed(2)}deg) scale3d(${
            transform.scale
          }, ${transform.scale}, ${transform.scale})`,
          transformStyle: "preserve-3d",
          transition: isHovered
            ? "transform 0.1s cubic-bezier(0.2, 0, 0.2, 1)"
            : "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        {children}

        {/* Specular Glare Sheen */}
        {glare && (
          <div
            className="tilt-3d-glare"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              pointerEvents: "none",
              background: `radial-gradient(circle at ${transform.glareX}% ${transform.glareY}%, rgba(255, 255, 255, ${transform.glareAlpha}) 0%, rgba(255, 255, 255, 0) 65%)`,
              transition: isHovered
                ? "opacity 0.15s ease"
                : "opacity 0.4s ease",
              opacity: isHovered ? 1 : 0,
              zIndex: 30,
              mixBlendMode: "overlay",
            }}
          />
        )}
      </div>
    </div>
  );
}

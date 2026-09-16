"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Aria3DOrb - Interactive 3D WebGL Hologram / Gyroscopic Core for Aria
 * Renders an astrolabe-inspired 3D AI presence with concentric brass rings,
 * a crystalline inner core, orbital data nodes, and audio-reactive pulsations.
 */
export default function Aria3DOrb({
  size = 280,
  isSpeaking = false,
  interactive = true,
  className = "",
}) {
  const containerRef = useRef(null);
  const isSpeakingRef = useRef(isSpeaking);
  isSpeakingRef.current = isSpeaking;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 7.5;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch (e) {
      console.warn("WebGL not supported, fallback to CSS", e);
      return;
    }

    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    container.appendChild(renderer.domElement);

    // ROOT GROUP FOR ROTATION
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. INNER CORE (Pulsating icosahedron / sphere)
    const coreGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xb08d3e,
      emissive: 0x4f7a64,
      emissiveIntensity: 0.55,
      roughness: 0.25,
      metalness: 0.85,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    rootGroup.add(coreMesh);

    // Inner glowing sphere
    const innerGlowGeo = new THREE.SphereGeometry(0.75, 24, 24);
    const innerGlowMat = new THREE.MeshBasicMaterial({
      color: 0xd9bc7a,
      wireframe: false,
      transparent: true,
      opacity: 0.45,
    });
    const innerGlowMesh = new THREE.Mesh(innerGlowGeo, innerGlowMat);
    rootGroup.add(innerGlowMesh);

    // 2. ORBITAL GYROSCOPE RINGS (Antique Brass)
    const createRing = (radius, tube, rotX, rotY, color = 0xb08d3e) => {
      const ringGeo = new THREE.TorusGeometry(radius, tube, 16, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.25,
        metalness: 0.9,
        roughness: 0.2,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = rotX;
      ringMesh.rotation.y = rotY;
      return ringMesh;
    };

    const ring1 = createRing(2.0, 0.025, Math.PI / 4, 0, 0xd9bc7a);
    const ring2 = createRing(2.35, 0.022, -Math.PI / 3, Math.PI / 6, 0xb08d3e);
    const ring3 = createRing(2.7, 0.018, Math.PI / 2.5, -Math.PI / 4, 0x4f7a64);

    rootGroup.add(ring1);
    rootGroup.add(ring2);
    rootGroup.add(ring3);

    // 3. FLOATING DATA NODES / PARTICLES
    const particleCount = 70;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2.1 + Math.random() * 1.1;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xede8da,
      size: 0.06,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particleSystem);

    // 4. LIGHTING
    const pointLight = new THREE.PointLight(0xd9bc7a, 2.5, 50);
    pointLight.position.set(3, 4, 5);
    scene.add(pointLight);

    const sageLight = new THREE.PointLight(0x4f7a64, 2, 50);
    sageLight.position.set(-4, -3, -2);
    scene.add(sageLight);

    const ambientLight = new THREE.AmbientLight(0x10121b, 1.2);
    scene.add(ambientLight);

    // 5. MOUSE TRACKING
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const onPointerMove = (e) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetMouseX = x * 1.5;
      targetMouseY = y * 1.5;
    };

    window.addEventListener("pointermove", onPointerMove);

    // 6. ANIMATION LOOP
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      const speaking = isSpeakingRef.current;

      // Smooth mouse tilt damping
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      rootGroup.rotation.y = mouseX * 0.8 + elapsedTime * 0.15;
      rootGroup.rotation.x = mouseY * 0.8 + Math.sin(elapsedTime * 0.4) * 0.08;

      // Independent ring rotations
      const speedMult = speaking ? 2.2 : 1.0;
      ring1.rotation.z += 0.012 * speedMult;
      ring2.rotation.x += 0.009 * speedMult;
      ring3.rotation.y -= 0.014 * speedMult;

      // Core pulsing
      const pulseFreq = speaking ? 6.0 : 1.8;
      const pulseAmp = speaking ? 0.18 : 0.05;
      const scale = 1.0 + Math.sin(elapsedTime * pulseFreq) * pulseAmp;
      coreMesh.scale.set(scale, scale, scale);
      innerGlowMesh.scale.set(scale * 1.1, scale * 1.1, scale * 1.1);

      coreMat.emissiveIntensity = speaking
        ? 0.8 + Math.sin(elapsedTime * 8) * 0.3
        : 0.45 + Math.sin(elapsedTime * 2) * 0.15;

      // Particle system rotation
      particleSystem.rotation.y = elapsedTime * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // CLEANUP
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", onPointerMove);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Three resources
      coreGeo.dispose();
      coreMat.dispose();
      innerGlowGeo.dispose();
      innerGlowMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [size, interactive]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none pointer-events-auto ${className}`}
      style={{ width: size, height: size }}
      title="Aria 3D Core"
    />
  );
}

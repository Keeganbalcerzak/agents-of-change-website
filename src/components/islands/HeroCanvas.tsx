import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sparkles, Sphere } from "@react-three/drei";
import * as THREE from "three";

interface HeroCanvasProps {
  enabled?: boolean;
  quality?: "high" | "medium" | "low";
  opacity?: number;
  deferMode?: "visible" | "idle";
  maxDpr?: number;
  performancePreset?: "balanced" | "cinematic";
}

function DynamicShape({
  quality,
  performancePreset,
}: {
  quality: "high" | "medium" | "low";
  performancePreset: "balanced" | "cinematic";
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cinematic = performancePreset === "cinematic";
  const detail = quality === "high" ? (cinematic ? 74 : 58) : quality === "medium" ? (cinematic ? 56 : 42) : 30;
  const sparkleCount = quality === "high" ? (cinematic ? 88 : 62) : quality === "medium" ? (cinematic ? 58 : 40) : 24;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.08;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.12;
    }
  });

  return (
    <Float speed={cinematic ? 1.8 : 1.4} rotationIntensity={cinematic ? 0.44 : 0.32} floatIntensity={cinematic ? 1.2 : 0.95}>
      <Sphere ref={meshRef} args={[1, detail, detail]} scale={1.18}>
        <MeshDistortMaterial
          color="#e9d5ff"
          attach="material"
          distort={quality === "low" ? 0.2 : quality === "medium" ? 0.28 : 0.35}
          speed={cinematic ? 1.45 : 1.1}
          roughness={0.14}
          metalness={0.22}
          envMapIntensity={0.8}
          clearcoat={1}
          clearcoatRoughness={0.14}
        />
      </Sphere>
      <Sparkles count={sparkleCount} scale={9} size={1.4} speed={0.26} opacity={0.2} color="#a78bfa" />
    </Float>
  );
}

export default function HeroCanvas({
  enabled = true,
  quality,
  opacity = 0.32,
  deferMode = "visible",
  maxDpr = 1.5,
  performancePreset = "balanced",
}: HeroCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isEligible, setIsEligible] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const desktopViewport = window.innerWidth >= 1024;
      const nextEligible = Boolean(enabled) && desktopViewport && !reduced;
      setIsEligible(nextEligible);
      if (!nextEligible) {
        setIsActivated(false);
      }
    };

    evaluate();
    window.addEventListener("resize", evaluate, { passive: true });
    return () => window.removeEventListener("resize", evaluate);
  }, [enabled]);

  useEffect(() => {
    if (!isEligible) {
      return;
    }

    if (deferMode === "idle") {
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      let idleId = 0;
      let cancelled = false;
      const activate = () => {
        if (!cancelled) {
          setIsActivated(true);
        }
      };

      if ("requestIdleCallback" in window) {
        idleId = (window as Window & { requestIdleCallback: (cb: () => void, options?: { timeout: number }) => number })
          .requestIdleCallback(activate, { timeout: 1200 });
      } else {
        timeoutId = setTimeout(activate, 220);
      }

      return () => {
        cancelled = true;
        if ("cancelIdleCallback" in window && idleId) {
          (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
        }
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId);
        }
      };
    }

    const node = containerRef.current;
    if (!node) {
      setIsActivated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (visible) {
          setIsActivated(true);
          observer.disconnect();
        }
      },
      { rootMargin: "260px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [deferMode, isEligible]);

  const resolvedQuality = useMemo<"high" | "medium" | "low">(() => {
    if (quality) {
      return quality;
    }

    return performancePreset === "cinematic" ? "medium" : "low";
  }, [performancePreset, quality]);

  const dpr = useMemo<[number, number]>(() => {
    const boundedMax = Math.max(1, Math.min(2, maxDpr));
    if (resolvedQuality === "high") return [1, Math.min(boundedMax, 1.8)];
    if (resolvedQuality === "medium") return [1, Math.min(boundedMax, 1.45)];
    return [1, Math.min(boundedMax, 1.2)];
  }, [maxDpr, resolvedQuality]);

  if (!isEligible) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="hero-canvas-container"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        opacity,
      }}
      aria-hidden="true"
    >
      {isActivated && (
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={dpr}>
          <ambientLight intensity={1.25} />
          <directionalLight position={[10, 10, 5]} intensity={2.4} color="#f3e6ff" />
          <directionalLight position={[-10, -10, -5]} intensity={1.4} color="#8b5cf6" />
          <pointLight position={[0, -5, 5]} intensity={1.3} color="#6d3fa8" />
          <DynamicShape quality={resolvedQuality} performancePreset={performancePreset} />
        </Canvas>
      )}
    </div>
  );
}

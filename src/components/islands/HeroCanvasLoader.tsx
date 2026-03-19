import React, { lazy, Suspense, useEffect, useState } from "react";

const LazyHeroCanvas = lazy(() => import("./HeroCanvas"));

interface HeroCanvasLoaderProps {
  enabled?: boolean;
  quality?: "high" | "medium" | "low";
  opacity?: number;
  deferMode?: "visible" | "idle";
  maxDpr?: number;
  performancePreset?: "balanced" | "cinematic";
}

type MaybeNavigator = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

type MediaQueryListWithLegacy = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

function addMediaQueryChangeListener(query: MediaQueryListWithLegacy, listener: (event: MediaQueryListEvent) => void) {
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", listener);
    return;
  }

  query.addListener?.(listener);
}

function removeMediaQueryChangeListener(query: MediaQueryListWithLegacy, listener: (event: MediaQueryListEvent) => void) {
  if (typeof query.removeEventListener === "function") {
    query.removeEventListener("change", listener);
    return;
  }

  query.removeListener?.(listener);
}

export default function HeroCanvasLoader(props: HeroCanvasLoaderProps) {
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    const desktopMedia = window.matchMedia("(min-width: 1024px)") as MediaQueryListWithLegacy;
    const reducedMotionMedia = window.matchMedia("(prefers-reduced-motion: reduce)") as MediaQueryListWithLegacy;

    const evaluate = () => {
      const nav = navigator as MaybeNavigator;
      const hasDesktopViewport = desktopMedia.matches;
      const allowsMotion = !reducedMotionMedia.matches;
      const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const cores = navigator.hardwareConcurrency ?? 4;
      const memory = nav.deviceMemory ?? 4;
      const saveData = nav.connection?.saveData === true;

      setEligible(
        hasDesktopViewport &&
          allowsMotion &&
          hasFinePointer &&
          cores >= 6 &&
          memory >= 4 &&
          !saveData,
      );
    };

    evaluate();
    addMediaQueryChangeListener(desktopMedia, evaluate);
    addMediaQueryChangeListener(reducedMotionMedia, evaluate);
    window.addEventListener("resize", evaluate, { passive: true });

    return () => {
      removeMediaQueryChangeListener(desktopMedia, evaluate);
      removeMediaQueryChangeListener(reducedMotionMedia, evaluate);
      window.removeEventListener("resize", evaluate);
    };
  }, []);

  if (!eligible) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <LazyHeroCanvas {...props} />
    </Suspense>
  );
}

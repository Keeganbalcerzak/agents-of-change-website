import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { trackEvent } from "@/lib/analytics";

const SCRUB_TRIGGER_ID = "data-driven-pass-strategy-scrub";
const COMPACT_TRIGGER_ID = "data-driven-pass-strategy-scrub-compact";

const strategyPhases = [
  {
    id: "phase-diagnose",
    label: "Phase 01",
    title: "Filter the noise",
    copy: "Find the highest-impact domains first so overwhelmed study time turns into a clear attack plan.",
    metric: "Output: priority map + realistic pacing baseline",
  },
  {
    id: "phase-adapt",
    label: "Phase 02",
    title: "Train the reasoning",
    copy: "Use rationales, simulations, and pattern review to strengthen how you think through social work questions.",
    metric: "Output: stronger logic + confidence shifts",
  },
  {
    id: "phase-pressure-test",
    label: "Phase 03",
    title: "Walk in ready",
    copy: "Pressure-test exam-day pacing and decision-making until readiness feels earned instead of hoped for.",
    metric: "Output: final calibration + go-test confidence",
  },
];

const clampProgress = (value: number) => Math.min(1, Math.max(0, value));

interface SequenceScrubberProps {
  backgroundMode?: "current" | "aurora";
  intensity?: "default" | "legendary";
  quality?: "balanced" | "cinematic";
  frameCap?: 30 | 60;
}

interface DerivedMetrics {
  readiness: number;
  answeredQuestions: number;
  confidence: number;
}

function deriveMetrics(progress: number): DerivedMetrics {
  const normalized = clampProgress(progress);
  return {
    readiness: Math.round(38 + normalized * 62),
    answeredQuestions: Math.round(24 + normalized * 486),
    confidence: Math.round(18 + normalized * 82),
  };
}

function phaseSummary(index: number): string {
  const bounded = Math.max(0, Math.min(strategyPhases.length - 1, index));
  return `${strategyPhases[bounded].label} active: ${strategyPhases[bounded].title}`;
}

export default function SequenceScrubber({
  backgroundMode = "current",
  intensity = "default",
  quality = "balanced",
  frameCap = 30,
}: SequenceScrubberProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;

    if (!section || !canvas) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.getById(SCRUB_TRIGGER_ID)?.kill();
    ScrollTrigger.getById(COMPACT_TRIGGER_ID)?.kill();

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const desktopSequence = window.matchMedia("(min-width: 1024px)").matches;
    const legendaryMode = intensity === "legendary";
    const cinematicQuality = quality === "cinematic";
    const maxFrameInterval = Math.max(8, Math.round(1000 / frameCap));

    const phaseNodes = Array.from(section.querySelectorAll<HTMLElement>("[data-sequence-phase]"));
    const progressCard = section.querySelector<HTMLElement>("[data-sequence-progress-card]");
    const readinessNode = section.querySelector<HTMLElement>("[data-sequence-counter='readiness']");
    const answeredNode = section.querySelector<HTMLElement>("[data-sequence-counter='answered']");
    const confidenceNode = section.querySelector<HTMLElement>("[data-sequence-counter='confidence']");
    const phaseSummaryNode = section.querySelector<HTMLElement>("[data-sequence-phase-summary]");

    let width = 0;
    let height = 0;
    let renderedProgress = 0;
    let lastRenderAt = 0;
    let sectionVisible = true;
    let resizeRaf = 0;
    let activePhaseIndex = -1;
    const completedPhases = new Set<string>();

    const visibilityObserver =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              sectionVisible = entries.some((entry) => entry.isIntersecting);
            },
            { rootMargin: "220px 0px" },
          )
        : null;

    visibilityObserver?.observe(section);

    section.classList.remove("reduced-motion");
    section.classList.toggle("sequence-section--compact", !desktopSequence);

    const updateLiveMetrics = (progress: number) => {
      const metrics = deriveMetrics(progress);
      if (readinessNode) {
        readinessNode.textContent = `${metrics.readiness}%`;
      }
      if (answeredNode) {
        answeredNode.textContent = `${metrics.answeredQuestions}`;
      }
      if (confidenceNode) {
        confidenceNode.textContent = `${metrics.confidence}%`;
      }
    };

    const updatePhaseStates = (progress: number) => {
      if (phaseNodes.length === 0) {
        return;
      }

      const normalized = clampProgress(progress);
      const segmentSize = 1 / phaseNodes.length;
      const nextIndex = Math.min(phaseNodes.length - 1, Math.floor(normalized * phaseNodes.length));
      const shouldAnimatePhaseShift = !prefersReducedMotion && activePhaseIndex !== -1 && activePhaseIndex !== nextIndex;

      phaseNodes.forEach((node, index) => {
        const phaseStart = index * segmentSize;
        const phaseEnd = phaseStart + segmentSize;
        const phaseProgress = clampProgress((normalized - phaseStart) / (phaseEnd - phaseStart));
        const isComplete = phaseProgress >= 0.999 && index <= nextIndex;
        const isActive = index === nextIndex;

        node.style.setProperty("--phase-progress", phaseProgress.toFixed(4));
        node.classList.toggle("is-active", isActive);
        node.classList.toggle("is-complete", isComplete);

        const phaseCounterNode = node.querySelector<HTMLElement>("[data-sequence-phase-counter]");
        if (phaseCounterNode) {
          phaseCounterNode.textContent = `${Math.round(phaseProgress * 100)}% loaded`;
        }

        const phaseStatusNode = node.querySelector<HTMLElement>("[data-sequence-phase-status]");
        if (phaseStatusNode) {
          phaseStatusNode.textContent = isComplete ? "Complete" : isActive ? "In progress" : "Queued";
        }

        const phase = strategyPhases[index];
        if (phase && isComplete && !completedPhases.has(phase.id)) {
          completedPhases.add(phase.id);
          trackEvent("data_phase_complete", {
            module_id: "data-driven-pass-strategy",
            phase_id: phase.id,
            phase_number: index + 1,
          });
        }
      });

      if (phaseSummaryNode) {
        phaseSummaryNode.textContent = phaseSummary(nextIndex);
      }

      if (shouldAnimatePhaseShift) {
        gsap.fromTo(
          phaseNodes,
          { y: 8, opacity: 0.92 },
          { y: 0, opacity: 1, duration: 0.42, ease: "power2.out", stagger: 0.03, overwrite: true },
        );
        if (progressCard) {
          gsap.fromTo(
            progressCard,
            { y: 6, opacity: 0.9 },
            { y: 0, opacity: 1, duration: 0.36, ease: "power2.out", overwrite: true },
          );
        }
      }

      activePhaseIndex = nextIndex;
    };

    const render = (progress: number) => {
      if (width === 0 || height === 0) {
        return;
      }

      const normalizedProgress = clampProgress(progress);
      const easedProgress = normalizedProgress * normalizedProgress * (3 - 2 * normalizedProgress);
      const compactMode = !desktopSequence;

      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createRadialGradient(
        width * (0.5 + normalizedProgress * 0.08),
        height * (0.48 - normalizedProgress * 0.06),
        Math.min(width, height) * 0.08,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.82,
      );

      if (backgroundMode === "aurora") {
        gradient.addColorStop(0, `rgba(196, 181, 253, ${0.24 + easedProgress * 0.2})`);
        gradient.addColorStop(0.35, `rgba(168, 139, 250, ${0.17 + easedProgress * 0.13})`);
        gradient.addColorStop(0.62, `rgba(139, 92, 246, ${0.12 + easedProgress * 0.1})`);
        gradient.addColorStop(1, "rgba(18, 7, 38, 0.93)");
      } else {
        gradient.addColorStop(0, `rgba(184, 137, 255, ${0.24 + easedProgress * 0.21})`);
        gradient.addColorStop(0.35, `rgba(124, 58, 237, ${0.17 + easedProgress * 0.11})`);
        gradient.addColorStop(1, "rgba(24, 11, 47, 0.92)");
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const lineCount = Math.max(
        compactMode ? 10 : legendaryMode ? (cinematicQuality ? 20 : 16) : cinematicQuality ? 14 : 11,
        Math.floor(height / (compactMode ? 40 : cinematicQuality ? 30 : 36)),
      );
      const nodesPerLine = Math.max(
        compactMode ? 16 : legendaryMode ? (cinematicQuality ? 26 : 22) : cinematicQuality ? 20 : 16,
        Math.floor(width / (compactMode ? 42 : cinematicQuality ? 32 : 38)),
      );
      const spreadY = height * (legendaryMode ? 0.2 + easedProgress * 0.4 : 0.15 + easedProgress * 0.28);
      const baseAmplitude = height * (legendaryMode ? 0.028 + easedProgress * 0.11 : 0.017 + easedProgress * 0.07);
      const horizontalPadding = width * 0.08;
      const usableWidth = width - horizontalPadding * 2;
      const centerY = height * 0.52;

      for (let line = 0; line < lineCount; line += 1) {
        const lineProgress = line / Math.max(1, lineCount - 1);
        const lineAmplitude = baseAmplitude * (0.4 + lineProgress * 1.2);
        const lineOffset = (lineProgress - 0.5) * spreadY;

        ctx.beginPath();

        for (let node = 0; node < nodesPerLine; node += 1) {
          const nodeProgress = node / Math.max(1, nodesPerLine - 1);
          const waveA = Math.sin(
            nodeProgress * Math.PI * (4.2 + easedProgress * 2.8) + lineProgress * 7 + easedProgress * 9,
          );
          const waveB = Math.cos(nodeProgress * Math.PI * 2.5 + lineProgress * 5.2 + easedProgress * 13);

          const waveShift = legendaryMode ? 7 + 16 * easedProgress : 5 + 11 * easedProgress;
          const x = horizontalPadding + nodeProgress * usableWidth + waveB * waveShift;
          const y = centerY + lineOffset + waveA * lineAmplitude + waveB * lineAmplitude * 0.25;

          if (node === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        const hue = 262 - easedProgress * 16 + lineProgress * 10;
        const saturation = 78 + easedProgress * 12;
        const lightness = 62 + easedProgress * 10;
        const alpha = legendaryMode
          ? 0.03 + lineProgress * 0.06 + easedProgress * 0.16
          : 0.025 + lineProgress * 0.05 + easedProgress * 0.11;

        ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${Math.min(0.42, alpha)})`;
        ctx.lineWidth = legendaryMode ? 0.62 + easedProgress * 1.4 : 0.52 + easedProgress * 0.95;
        ctx.stroke();
      }

      ctx.globalCompositeOperation = "screen";
      for (let ring = 0; ring < (legendaryMode ? 2 : 1); ring += 1) {
        const ringRadius = Math.min(width, height) * (0.11 + ring * 0.08 + easedProgress * (legendaryMode ? 0.14 : 0.09));
        ctx.beginPath();
        ctx.arc(width * 0.5, height * (0.5 - easedProgress * 0.04), ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(216, 180, 255, ${0.12 - ring * 0.028 + easedProgress * 0.05})`;
        ctx.lineWidth = 1.2 + ring * 0.8;
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";

      const glowRadius = Math.min(width, height) * (0.06 + easedProgress * (legendaryMode ? 0.18 : 0.12));
      const glow = ctx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, glowRadius);
      glow.addColorStop(0, "rgba(233, 213, 255, 0.34)");
      glow.addColorStop(0.55, `rgba(167, 139, 250, ${0.14 + easedProgress * 0.2})`);
      glow.addColorStop(1, "rgba(88, 28, 135, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.5, glowRadius, 0, Math.PI * 2);
      ctx.fill();
    };

    const setProgress = (progress: number, force = false) => {
      if (!force) {
        if (!sectionVisible) {
          return;
        }

        const now = performance.now();
        if (now - lastRenderAt < maxFrameInterval) {
          return;
        }

        lastRenderAt = now;
      }

      renderedProgress = clampProgress(progress);
      section.style.setProperty("--sequence-progress", renderedProgress.toFixed(4));
      render(renderedProgress);
      updateLiveMetrics(renderedProgress);
      updatePhaseStates(renderedProgress);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, cinematicQuality ? 1.8 : 1.4);
      width = Math.max(1, Math.round(section.clientWidth));
      height = Math.max(1, Math.round(window.innerHeight));

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      setProgress(renderedProgress, true);
    };

    const onResize = () => {
      if (resizeRaf) {
        window.cancelAnimationFrame(resizeRaf);
      }
      resizeRaf = window.requestAnimationFrame(() => {
        resize();
        ScrollTrigger.refresh();
      });
    };

    resize();
    setProgress(0, true);
    window.addEventListener("resize", onResize, { passive: true });

    if (prefersReducedMotion) {
      section.classList.add("reduced-motion");
      setProgress(0.42, true);

      return () => {
        window.removeEventListener("resize", onResize);
        if (resizeRaf) {
          window.cancelAnimationFrame(resizeRaf);
        }
        visibilityObserver?.disconnect();
      };
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        ".sequence-shell",
        { opacity: 0.45, y: 40 },
        { opacity: 1, y: 0, duration: 0.95, ease: "power3.out" },
      );

      if (desktopSequence) {
        ScrollTrigger.create({
          id: SCRUB_TRIGGER_ID,
          trigger: section,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * (legendaryMode ? 1.15 : 0.95))}`,
          pin: true,
          scrub: legendaryMode ? 0.18 : 0.12,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setProgress(self.progress);
          },
        });
      } else {
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              id: COMPACT_TRIGGER_ID,
              trigger: section,
              start: "top 82%",
              end: "bottom top",
              scrub: legendaryMode ? 0.26 : 0.18,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                setProgress(self.progress);
              },
            },
          })
          .fromTo(".sequence-header", { y: 24, opacity: 0.62 }, { y: 0, opacity: 1, duration: 0.35 }, 0)
          .fromTo(".sequence-phase", { y: 24, opacity: 0.48 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.08 }, 0)
          .fromTo(".sequence-progress-card", { y: 18, opacity: 0.5 }, { y: 0, opacity: 1, duration: 0.45 }, 0.08);
      }
    }, section);

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 120);

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener("resize", onResize);
      if (resizeRaf) {
        window.cancelAnimationFrame(resizeRaf);
      }
      visibilityObserver?.disconnect();
      context.revert();
    };
  }, [backgroundMode, frameCap, intensity, quality]);

  return (
    <section
      ref={sectionRef}
      className={`sequence-section${backgroundMode === "aurora" ? " sequence-section--aurora" : ""}`}
      aria-labelledby="pass-strategy-title"
      data-module="data-driven-pass-strategy"
      data-motion-tier="hero"
      data-motion-variant="none"
      data-motion-density="cinematic"
      data-module-no-parallax="true"
    >
      <canvas ref={canvasRef} className="sequence-canvas" aria-hidden="true" />
      <div className="sequence-vignette" aria-hidden="true"></div>
      <div className="sequence-noise" aria-hidden="true"></div>

      <div className="sequence-shell">
        <header className="sequence-header">
          <p className="sequence-kicker">How the system works</p>
          <h2 id="pass-strategy-title" className="sequence-title">
            The strategy that turns <span>panic into passing decisions</span>
          </h2>
          <p className="sequence-subtitle">
            This is not random content delivery. Each phase is designed to move someone from anxious, scattered prep
            into calm exam-day execution.
          </p>
        </header>

        <div className="sequence-grid">
          <ol className="sequence-phases" aria-label="Pass strategy phases">
            {strategyPhases.map((phase, index) => (
              <li key={phase.id} className={`sequence-phase${index === 0 ? " is-active" : ""}`} data-sequence-phase>
                <p className="sequence-phase-label">{phase.label}</p>
                <h3>{phase.title}</h3>
                <p className="sequence-phase-status" data-sequence-phase-status>
                  In progress
                </p>
                <div className="sequence-phase-meter" aria-hidden="true">
                  <span className="sequence-phase-meter-fill"></span>
                </div>
                <p className="sequence-phase-live" data-sequence-phase-counter>
                  0% loaded
                </p>
                <p>{phase.copy}</p>
                <p className="sequence-phase-metric">{phase.metric}</p>
              </li>
            ))}
          </ol>

          <aside className="sequence-progress-card" aria-label="Strategy progress indicator" aria-live="polite" data-sequence-progress-card>
            <p className="sequence-progress-label">System progress</p>
            <div className="sequence-progress-track">
              <span className="sequence-progress-fill"></span>
            </div>
            <p className="sequence-progress-copy" data-sequence-phase-summary>
              {phaseSummary(0)}
            </p>
            <ul className="sequence-metric-list" aria-label="Live strategy counters">
              <li>
                <span>Readiness index</span>
                <strong data-sequence-counter="readiness">38%</strong>
              </li>
              <li>
                <span>Answered questions</span>
                <strong data-sequence-counter="answered">24</strong>
              </li>
              <li>
                <span>Pattern confidence</span>
                <strong data-sequence-counter="confidence">18%</strong>
              </li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}

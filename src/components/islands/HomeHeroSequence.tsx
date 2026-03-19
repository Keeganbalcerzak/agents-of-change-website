"use client";

import { useEffect, useState } from "react";
import ShimmerButton from "@/components/ui/magic/shimmer-button";

const firstWeekOutcomes = [
  "Personalized 7-day study blueprint aligned to your exam window",
  "High-yield domain prioritization based on first-pass diagnostic logic",
  "Rationale-driven practice workflow to improve answer confidence",
  "Confidence calibration checkpoints before full simulation cycles",
];

const rotatingWords = ["confidence", "clarity", "control"];

export default function HomeHeroSequence() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      return;
    }

    const interval = window.setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 1800);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <>
      <div className="hero-copy hero-entry hero-entry-copy">
        <p className="eyebrow premium-eyebrow">Built for first-time test takers</p>

        <h1 id="hero-title">
          A premium study system for social workers who need to pass with
          {" "}
          <span className="hero-keyword-rotator">{rotatingWords[wordIndex]}</span>
        </h1>

        <p>
          Agents of Change combines exam strategy, rationale-based practice, and accountability architecture so your
          study time drives measurable score movement.
        </p>

        <div className="hero-proof" aria-label="Proof points">
          <span className="hero-proof-item hero-proof-item-strong">ASWB ACE Provider #1919</span>
          <span className="hero-proof-item">159 CE courses</span>
          <span className="hero-proof-item">Practice exams #1, #2, #3</span>
        </div>

        <div className="hero-actions hero-actions-multi">
          <ShimmerButton href="/start-trial" data-cta="hero-start-trial" data-cta-location="hero-main">
            Start Free Trial
          </ShimmerButton>
          <a href="/exam-prep" className="button hero-cta hero-cta-blue" data-cta="hero-view-programs" data-cta-location="hero-main">
            Compare Programs
          </a>
          <a href="/#sally-story" className="button ghost" data-cta="hero-sally-story" data-cta-location="hero-main">
            Follow Sally&apos;s Story
          </a>
        </div>
      </div>

      <aside className="hero-panel hero-panel-editorial hero-entry hero-entry-panel" aria-label="Trial outcomes">
        <h2>What you unlock in your first week</h2>
        <p>Every trial starts with a high-clarity plan, not generic content browsing.</p>
        <ul>
          {firstWeekOutcomes.map((outcome) => (
            <li key={outcome}>{outcome}</li>
          ))}
        </ul>
      </aside>
    </>
  );
}

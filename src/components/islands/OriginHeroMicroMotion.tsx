"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { motion, useReducedMotion } from "motion/react";

interface OriginHeroMicroMotionProps {
  rootSelector: string;
}

export default function OriginHeroMicroMotion({ rootSelector }: OriginHeroMicroMotionProps) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(rootSelector);
    if (!root || shouldReduceMotion) {
      return;
    }

    const glows = Array.from(root.querySelectorAll<HTMLElement>("[data-origin-glow]"));
    if (glows.length === 0) {
      return;
    }

    const timeline = gsap.timeline({
      repeat: -1,
      yoyo: true,
      defaults: { duration: 6.4, ease: "sine.inOut" },
    });

    glows.forEach((node, index) => {
      timeline.to(
        node,
        {
          x: index % 2 === 0 ? 16 : -14,
          y: index % 2 === 0 ? -12 : 14,
          scale: 1.04 + index * 0.03,
        },
        0,
      );
    });

    return () => {
      timeline.kill();
    };
  }, [rootSelector, shouldReduceMotion]);

  const motionProps = (delay: number) =>
    shouldReduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18, filter: "blur(6px)" },
          whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
          viewport: { once: true, amount: 0.55 },
          transition: { duration: 0.56, delay },
        };

  return (
    <motion.div
      className="origin-copy"
      initial={shouldReduceMotion ? undefined : { opacity: 0 }}
      animate={shouldReduceMotion ? undefined : { opacity: 1 }}
      transition={shouldReduceMotion ? undefined : { duration: 0.45 }}
    >
      <motion.p className="origin-kicker" {...motionProps(0.02)}>
        Social Work Exam Prep
      </motion.p>
      <motion.h1 id="origin-cinematic-title" {...motionProps(0.1)}>
        Pass with clarity. Keep <span className="origin-variable-word">growing</span>.
      </motion.h1>
      <motion.p className="origin-subcopy" {...motionProps(0.18)}>
        Structured social work exam prep for real schedules, with support that still matters after you pass.
      </motion.p>
    </motion.div>
  );
}

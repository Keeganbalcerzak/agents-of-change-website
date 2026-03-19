"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useSpring, useTransform } from "motion/react";

interface NumberTickerProps {
  value: number;
  duration?: number;
  className?: string;
}

export default function NumberTicker({ value, duration = 1.2, className }: NumberTickerProps) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 22,
    stiffness: 120,
  });

  const formatted = useTransform(springValue, (latest) => Math.round(latest).toLocaleString());

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });

    return () => controls.stop();
  }, [duration, motionValue, value]);

  return <motion.span className={className}>{formatted}</motion.span>;
}

"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

interface BlurFadeProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
}

export default function BlurFade({
  children,
  className,
  delay = 0,
  duration = 0.6,
  yOffset = 16,
}: BlurFadeProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: yOffset, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        delay,
        duration,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

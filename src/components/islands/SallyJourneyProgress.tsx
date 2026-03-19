"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface SallyJourneyProgressProps {
  steps: Array<{ id: string }>;
}

export default function SallyJourneyProgress({ steps }: SallyJourneyProgressProps) {
  useEffect(() => {
    if (steps.length === 0) {
      return;
    }

    const section = document.querySelector<HTMLElement>("[data-sally-story-root]");
    const chapterNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-sally-step]"));
    const navNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-sally-nav-item]"));

    if (!section || chapterNodes.length === 0 || navNodes.length === 0) {
      return;
    }

    const viewed = new Set<string>();

    const setActiveStep = (id: string) => {
      const activeIndex = Math.max(
        0,
        chapterNodes.findIndex((node) => node.dataset.sallyStep === id),
      );

      chapterNodes.forEach((node) => {
        const isActive = node.dataset.sallyStep === id;
        node.classList.toggle("is-active", isActive);
      });

      navNodes.forEach((node) => {
        const isActive = node.dataset.sallyNavItem === id;
        node.classList.toggle("is-active", isActive);
        if (isActive) {
          node.setAttribute("aria-current", "step");
        } else {
          node.removeAttribute("aria-current");
        }
      });

      const progress = steps.length > 1 ? activeIndex / (steps.length - 1) : 1;
      section.style.setProperty("--sally-progress", progress.toFixed(4));

      if (!viewed.has(id)) {
        viewed.add(id);
        trackEvent("story_chapter_view", {
          step_id: id,
          step_number: activeIndex + 1,
        });
      }
    };

    setActiveStep(steps[0].id);

    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              let nextId: string | null = null;
              let strongest = 0;

              entries.forEach((entry) => {
                const target = entry.target as HTMLElement;
                const id = target.dataset.sallyStep;
                if (!id || !entry.isIntersecting) {
                  return;
                }

                if (entry.intersectionRatio > strongest) {
                  strongest = entry.intersectionRatio;
                  nextId = id;
                }
              });

              if (nextId) {
                setActiveStep(nextId);
              }
            },
            {
              threshold: [0.35, 0.6, 0.85],
              rootMargin: "-10% 0px -25% 0px",
            },
          )
        : null;

    chapterNodes.forEach((node) => observer?.observe(node));

    return () => observer?.disconnect();
  }, [steps]);

  return null;
}

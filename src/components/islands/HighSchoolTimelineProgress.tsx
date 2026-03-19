"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface HighSchoolTimelineProgressProps {
  steps: Array<{ id: string }>;
}

export default function HighSchoolTimelineProgress({ steps }: HighSchoolTimelineProgressProps) {
  useEffect(() => {
    if (steps.length === 0) {
      return;
    }

    const root = document.querySelector<HTMLElement>("[data-origin-timeline-root]");
    const stepNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-origin-step]"));
    const navNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-origin-nav-item]"));

    if (!root || stepNodes.length === 0 || navNodes.length === 0) {
      return;
    }

    const viewed = new Set<string>();

    const activateStep = (id: string) => {
      const activeIndex = Math.max(
        0,
        stepNodes.findIndex((node) => node.dataset.originStep === id),
      );

      stepNodes.forEach((node) => {
        node.classList.toggle("is-active", node.dataset.originStep === id);
      });

      navNodes.forEach((node) => {
        const isActive = node.dataset.originNavItem === id;
        node.classList.toggle("is-active", isActive);
        if (isActive) {
          node.setAttribute("aria-current", "step");
        } else {
          node.removeAttribute("aria-current");
        }
      });

      const progress = steps.length > 1 ? activeIndex / (steps.length - 1) : 1;
      root.style.setProperty("--origin-progress", progress.toFixed(4));

      if (!viewed.has(id)) {
        viewed.add(id);
        trackEvent("story_chapter_view", {
          step_id: id,
          step_number: activeIndex + 1,
          story_track: "origin_timeline",
        });
      }
    };

    activateStep(steps[0].id);

    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              let nextId: string | null = null;
              let strongest = 0;

              entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                  return;
                }

                const target = entry.target as HTMLElement;
                const id = target.dataset.originStep;
                if (!id) {
                  return;
                }

                if (entry.intersectionRatio > strongest) {
                  strongest = entry.intersectionRatio;
                  nextId = id;
                }
              });

              if (nextId) {
                activateStep(nextId);
              }
            },
            {
              threshold: [0.32, 0.56, 0.82],
              rootMargin: "-12% 0px -22% 0px",
            },
          )
        : null;

    stepNodes.forEach((node) => observer?.observe(node));

    return () => observer?.disconnect();
  }, [steps]);

  return null;
}

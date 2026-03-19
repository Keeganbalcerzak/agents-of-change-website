"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

interface SallyTimelineProgressProps {
  steps: Array<{ id: string; era: string; title: string }>;
}

export default function SallyTimelineProgress({ steps }: SallyTimelineProgressProps) {
  useEffect(() => {
    if (steps.length === 0) {
      return;
    }

    const root = document.querySelector<HTMLElement>("[data-sally-story-root]");
    const stepNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-sally-step]"));
    const navNodes = Array.from(document.querySelectorAll<HTMLElement>("[data-sally-nav-item]"));
    const navLinks = Array.from(document.querySelectorAll<HTMLElement>("[data-sally-nav-link]"));

    if (!root || stepNodes.length === 0 || navNodes.length === 0) {
      return;
    }

    const viewed = new Set<string>();
    let activeId = "";

    const activateStep = (id: string) => {
      if (!id || id === activeId) {
        return;
      }

      const activeIndex = Math.max(
        0,
        stepNodes.findIndex((node) => node.dataset.sallyStep === id),
      );

      stepNodes.forEach((node) => {
        node.classList.toggle("is-active", node.dataset.sallyStep === id);
      });

      navNodes.forEach((node) => {
        node.classList.toggle("is-active", node.dataset.sallyNavItem === id);
      });

      navLinks.forEach((link) => {
        const isActive = link.dataset.sallyNavLink === id;
        if (isActive) {
          link.setAttribute("aria-current", "step");
        } else {
          link.removeAttribute("aria-current");
        }
      });

      const progress = steps.length > 1 ? activeIndex / (steps.length - 1) : 1;
      root.style.setProperty("--sally-progress", progress.toFixed(4));

      if (!viewed.has(id)) {
        viewed.add(id);
        const stepMeta = steps[activeIndex];
        trackEvent("story_chapter_view", {
          step_id: id,
          step_number: activeIndex + 1,
          story_track: "sally_timeline",
          chapter_era: stepMeta?.era,
          chapter_title: stepMeta?.title,
        });
      }

      activeId = id;
    };

    activateStep(steps[0].id);

    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              let nextId: string | null = null;
              let strongestRatio = 0;

              entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                  return;
                }

                const id = (entry.target as HTMLElement).dataset.sallyStep;
                if (!id) {
                  return;
                }

                if (entry.intersectionRatio > strongestRatio) {
                  strongestRatio = entry.intersectionRatio;
                  nextId = id;
                }
              });

              if (nextId) {
                activateStep(nextId);
              }
            },
            {
              threshold: [0.3, 0.58, 0.84],
              rootMargin: "-10% 0px -24% 0px",
            },
          )
        : null;

    stepNodes.forEach((node) => observer?.observe(node));

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let cleanupGsap = () => {};
    let isUnmounted = false;

    if (!prefersReducedMotion) {
      void Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
        .then(([gsapModule, triggerModule]) => {
          const gsap = gsapModule.gsap;
          const ScrollTrigger = triggerModule.ScrollTrigger;
          gsap.registerPlugin(ScrollTrigger);

          const context = gsap.context(() => {
            gsap.to(root, {
              "--sally-progress": 1,
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.3,
              },
            });
          }, root);

          if (isUnmounted) {
            context.revert();
            return;
          }

          cleanupGsap = () => {
            context.revert();
          };
        })
        .catch(() => {
          // Keep this component resilient if dynamic imports fail.
        });
    }

    return () => {
      isUnmounted = true;
      observer?.disconnect();
      cleanupGsap();
    };
  }, [steps]);

  return null;
}

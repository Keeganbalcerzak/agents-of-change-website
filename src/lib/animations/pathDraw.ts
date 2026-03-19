import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// AttrPlugin is part of GSAP 3 core — no separate import needed

export function initPathDraw() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // SVG path draw — stroke-dashoffset scrub
  const containers = document.querySelectorAll<SVGElement>('[data-path-container]');

  containers.forEach((container) => {
    const path = container.querySelector<SVGPathElement>('[data-path-draw]');
    if (!path) return;

    const length = path.getTotalLength();
    path.style.strokeDasharray = String(length);
    path.style.strokeDashoffset = String(length);

    if (prefersReduced) {
      gsap.to(path, { strokeDashoffset: 0, duration: 0.01 });
      // Reveal all milestones immediately
      container.querySelectorAll<SVGCircleElement>('[data-path-milestone]').forEach((dot) => {
        gsap.set(dot, { opacity: 1 });
      });
      return;
    }

    // Scrub path draw as section scrolls
    const section = container.closest<HTMLElement>('section') ?? container.parentElement;
    ScrollTrigger.create({
      trigger: section ?? container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => {
        path.style.strokeDashoffset = String(length * (1 - self.progress));
      },
    });

    // Milestone dots — pop in at evenly-spaced scroll progress thresholds
    const dots = Array.from(
      container.querySelectorAll<SVGCircleElement>('[data-path-milestone]'),
    );

    dots.forEach((dot, i) => {
      const threshold = ((i + 1) / dots.length) * 0.9; // last dot at 90% scroll
      gsap.set(dot, { opacity: 0 });

      ScrollTrigger.create({
        trigger: section ?? container,
        start: `${Math.round(threshold * 100)}% top`,
        once: true,
        onEnter: () => {
          gsap.to(dot, {
            attr: { r: 6 },
            opacity: 1,
            duration: 0.4,
            ease: 'back.out(2)',
          });
        },
      });
    });
  });
}

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initStagger() {
  // Card cascade — [data-stagger] containers with direct children
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((container) => {
    const children = Array.from(
      container.querySelectorAll<HTMLElement>('[data-stagger-item]')
    );
    if (!children.length) return;

    children.forEach((child) => {
      child.dataset.revealManaged = 'gsap-stagger';
    });

    if (prefersReduced()) {
      gsap.from(children, { opacity: 0, duration: 0.4, stagger: 0.05 });
      return;
    }

    const dir = container.dataset.stagger ?? 'up'; // 'up' | 'left'
    const fromX = dir === 'left' ? -28 : 0;
    const fromY = dir === 'up' ? 22 : 16;

    gsap.from(children, {
      x: fromX,
      y: fromY,
      opacity: 0,
      scale: 0.97,
      duration: 0.68,
      immediateRender: true,
      stagger: {
        each: 0.08,
        ease: 'power2.out',
      },
      ease: 'power3.out',
      scrollTrigger: {
        trigger: container,
        start: 'top 82%',
        once: true,
      },
    });
  });

  // .reveal elements use the CSS + IntersectionObserver system in BaseLayout.
  // GSAP does not touch them — no conflict, no double-animation.
}

import Splitting from 'splitting';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initSplitText() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const headings = document.querySelectorAll<HTMLElement>('[data-split-heading]');
  if (!headings.length) return;

  // Run Splitting.js to inject .word and .char spans
  Splitting({ target: '[data-split-heading]', by: 'chars' });

  headings.forEach((el) => {
    const chars = el.querySelectorAll<HTMLElement>('.char');
    if (!chars.length) return;

    if (prefersReduced) {
      // Simple fade only
      gsap.from(el, {
        opacity: 0,
        duration: 0.6,
        immediateRender: false,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
      return;
    }

    gsap.from(chars, {
      y: '110%',
      rotateX: -30,
      opacity: 0,
      duration: 0.55,
      stagger: 0.033,
      immediateRender: false,
      ease: 'power4.out',
      transformOrigin: '50% 100%',
      scrollTrigger: {
        trigger: el,
        start: 'top 86%',
        once: true,
      },
    });
  });
}

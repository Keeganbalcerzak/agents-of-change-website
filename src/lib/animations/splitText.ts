import Splitting from 'splitting';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initSplitText() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const useSimpleFade = prefersReduced || window.matchMedia('(max-width: 640px)').matches;

  const headings = document.querySelectorAll<HTMLElement>('[data-split-heading]');
  if (!headings.length) return;

  // Preserve original text for screen readers before Splitting wraps each
  // character in its own span (which causes "S t a r t" reading).
  headings.forEach((el) => {
    const original = el.textContent?.trim() ?? '';
    if (original) {
      el.setAttribute('aria-label', original);
    }
  });

  // Run Splitting.js to inject .word and .char spans
  Splitting({ target: '[data-split-heading]', by: 'chars' });

  // Mark the split DOM as presentational so screen readers use aria-label instead
  headings.forEach((el) => {
    el.querySelectorAll('.word, .char').forEach((span) => {
      span.setAttribute('aria-hidden', 'true');
    });
  });

  headings.forEach((el) => {
    const words = el.querySelectorAll<HTMLElement>('.word');
    const chars = el.querySelectorAll<HTMLElement>('.char');
    if (!chars.length) return;
    const text = el.textContent?.trim() ?? '';
    const isLongHeading = text.length > 42 || text.split(/\s+/).filter(Boolean).length > 6;

    if (useSimpleFade) {
      // On reduced motion and small screens, preserve readability over character choreography.
      gsap.from(el, {
        opacity: 0,
        duration: 0.6,
        immediateRender: false,
        ease: 'power2.out',
        onComplete: () => {
          gsap.set(el, { clearProps: 'opacity' });
          gsap.set(chars, { clearProps: 'opacity,transform' });
        },
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
      return;
    }

    if (isLongHeading && words.length) {
      gsap.from(words, {
        y: '32%',
        opacity: 0,
        duration: 0.5,
        stagger: 0.06,
        immediateRender: false,
        ease: 'power3.out',
        onComplete: () => {
          gsap.set(words, { clearProps: 'opacity,transform' });
        },
        scrollTrigger: {
          trigger: el,
          start: 'top 86%',
          once: true,
        },
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
      onComplete: () => {
        gsap.set(chars, { clearProps: 'opacity,transform' });
      },
      scrollTrigger: {
        trigger: el,
        start: 'top 86%',
        once: true,
      },
    });
  });
}

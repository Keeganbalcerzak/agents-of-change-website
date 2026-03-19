import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initZoneTransitions() {
  const transitions = document.querySelectorAll<HTMLElement>(
    '.zone-transition, .zone-transition-diagonal'
  );

  if (!transitions.length) return;

  if (prefersReduced()) {
    transitions.forEach((el) => el.classList.add('revealed'));
    return;
  }

  transitions.forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 65%',
      once: true,
      onEnter: () => el.classList.add('revealed'),
    });
  });
}

/** Ambient blob intensity — ramps up as user reaches deep zones */
export function initAmbientScroll() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency < 4) return;

  const deepSections = document.querySelectorAll<HTMLElement>('[data-zone="deep"]');

  deepSections.forEach((section) => {
    const blobs = section.querySelectorAll<HTMLElement>('.ambient-blob');
    if (!blobs.length) return;

    // Scrub opacity from 0.6 → 1 as section scrolls into view
    gsap.fromTo(
      blobs,
      { opacity: 0.6 },
      {
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'center center',
          scrub: 0.8,
        },
      }
    );
  });

  // Final CTA — blobs at maximum intensity
  const finalCta = document.querySelector<HTMLElement>('[data-zone="deep"][data-final-cta]');
  if (finalCta) {
    const blobs = finalCta.querySelectorAll<HTMLElement>('.ambient-blob');
    gsap.to(blobs, {
      scale: 1.2,
      opacity: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: finalCta,
        start: 'top 70%',
        end: 'center center',
        scrub: 0.6,
      },
    });
  }
}

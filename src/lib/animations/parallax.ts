import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const isTouch = () => window.matchMedia('(pointer: coarse)').matches;
const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initParallax() {
  if (isTouch() || prefersReduced()) return;

  // Ambient field — slowest layer
  document.querySelectorAll<HTMLElement>('.ambient-field').forEach((el) => {
    const section = el.closest<HTMLElement>('section, [data-zone]');
    if (!section) return;
    gsap.to(el, {
      y: 'var(--parallax-back, -48px)',
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  // Section content — mid layer
  document.querySelectorAll<HTMLElement>('[data-parallax="mid"]').forEach((el) => {
    const section = el.closest<HTMLElement>('section, [data-zone]');
    gsap.to(el, {
      y: 'var(--parallax-mid, -24px)',
      ease: 'none',
      scrollTrigger: {
        trigger: section ?? el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  // Foreground glass cards — closest layer
  document.querySelectorAll<HTMLElement>('[data-parallax="fore"]').forEach((el) => {
    const section = el.closest<HTMLElement>('section, [data-zone]');
    gsap.to(el, {
      y: 'var(--parallax-fore, -8px)',
      ease: 'none',
      scrollTrigger: {
        trigger: section ?? el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  // Nav backdrop deepens on scroll — reaches full opacity within first 300px
  const header = document.querySelector<HTMLElement>('header, [data-header]');
  if (header) {
    const updateHeader = () => {
      const scrollY = window.scrollY;
      const opacity = Math.min(Math.max(scrollY - 40, 0) / 260, 1);
      header.style.setProperty('--header-backdrop-opacity', String(opacity));
    };
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }
}

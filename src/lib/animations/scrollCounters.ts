import { CountUp } from 'countup.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollCounters() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = document.querySelectorAll<HTMLElement>('[data-countup]');

  els.forEach((el) => {
    const target = parseFloat(el.dataset.countup ?? '0');
    const suffix = el.dataset.suffix ?? '';
    const prefix = el.dataset.prefix ?? '';
    const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;

    const cu = new CountUp(el, target, {
      duration: prefersReduced ? 0.01 : 2.2,
      useEasing: true,
      separator: ',',
      suffix,
      prefix,
      decimalPlaces: decimals,
    });

    ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      once: true,
      onEnter: () => {
        if (!cu.error) cu.start();
      },
    });
  });
}

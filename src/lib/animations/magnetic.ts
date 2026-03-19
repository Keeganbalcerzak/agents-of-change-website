import { gsap } from 'gsap';

const MAGNETIC_RADIUS = 80;
const TILT_MAX_DEG = 12;

function isTouchDevice() {
  return window.matchMedia('(pointer: coarse)').matches;
}

/** Magnetic pull on CTA buttons — desktop only */
export function initMagneticButtons() {
  if (isTouchDevice()) return;

  const buttons = document.querySelectorAll<HTMLElement>('[data-magnetic]');

  buttons.forEach((btn) => {
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3.out' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3.out' });

    btn.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < MAGNETIC_RADIUS) {
        const pull = (MAGNETIC_RADIUS - dist) / MAGNETIC_RADIUS;
        xTo(dx * pull * 0.45);
        yTo(dy * pull * 0.45);
      }
    });

    btn.addEventListener('mouseleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}

/** 3D tilt effect on cards — desktop only */
export function initTiltCards() {
  if (isTouchDevice()) return;

  const cards = document.querySelectorAll<HTMLElement>('[data-tilt]');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltX = (y - 0.5) * TILT_MAX_DEG;
      const tiltY = (x - 0.5) * -TILT_MAX_DEG;

      gsap.to(card, {
        rotateX: tiltX,
        rotateY: tiltY,
        transformPerspective: 900,
        duration: 0.4,
        ease: 'power2.out',
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'power3.out',
      });
    });
  });
}

/**
 * Unified Animation Engine
 * Replaces the inline <script> in BaseLayout.astro.
 * Preserves all existing motion variants (reveal-stagger, story-stack, legendary-scrub)
 * and adds the new design-system animation modules.
 */

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// New modules
import { initSplitText } from './splitText';
import { initMagneticButtons, initTiltCards } from './magnetic';
import { initScrollCounters } from './scrollCounters';
import { initPathDraw } from './pathDraw';
import { initParallax } from './parallax';
import { initStagger } from './stagger';
import { initZoneTransitions, initAmbientScroll } from './zoneTransitions';

// AttrPlugin is included in GSAP 3 core — no separate import required
gsap.registerPlugin(ScrollTrigger);

// ─── Type aliases (mirrors old engine) ───────────────────────────────────────
type MotionVariant = 'none' | 'reveal-stagger' | 'legendary-scrub' | 'story-stack';
type MotionDensity = 'compact' | 'cinematic';
type MotionProfile = 'off' | 'lite' | 'cinematic';
type MotionCapability = 'auto' | 'desktop-only' | 'always';
type MaybeDeviceNavigator = Navigator & { deviceMemory?: number };

// ─── Device detection ─────────────────────────────────────────────────────────
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isDesktopViewport = () => window.matchMedia('(min-width: 1024px)').matches;
const hasFinePointer = () =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const hasHighCapabilityHardware = () => {
  const nav = navigator as MaybeDeviceNavigator;
  return (navigator.hardwareConcurrency ?? 4) >= 6 && (nav.deviceMemory ?? 4) >= 4;
};

// ─── Read motion profile from <body> ─────────────────────────────────────────
const body = document.body;
const motionProfile = (body.dataset.motionProfile as MotionProfile) || 'lite';
const motionCapability = (body.dataset.motionCapability as MotionCapability) || 'auto';
const supportsMotion = !prefersReducedMotion && motionProfile !== 'off';
const supportsCinematicMotion = motionProfile === 'cinematic' && isDesktopViewport();

// ─── Lenis ────────────────────────────────────────────────────────────────────
function shouldEnableLenis(): boolean {
  if (!supportsMotion) return false;
  if (motionCapability === 'always') return true;
  if (motionCapability === 'desktop-only') return isDesktopViewport();
  return isDesktopViewport() && hasFinePointer() && hasHighCapabilityHardware();
}

function getLenisLerp(): number {
  // Zone-aware lerp: deep=cinematic feel, light=snappier
  if (motionProfile === 'cinematic') return 0.085;
  if (motionProfile === 'lite') return 0.13;
  return 0.11;
}

const lenis = shouldEnableLenis()
  ? new Lenis({ lerp: getLenisLerp(), smoothWheel: true, syncTouch: false })
  : null;

if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  ScrollTrigger.addEventListener('refresh', () => lenis.resize());
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

// ─── Legacy motion variants (backward compat) ─────────────────────────────────
const resolveVariant = (node: HTMLElement): MotionVariant =>
  (node.getAttribute('data-motion-variant') as MotionVariant) || 'none';

const resolveDensity = (node: HTMLElement): MotionDensity => {
  const req = (node.getAttribute('data-motion-density') as MotionDensity) || 'compact';
  if (motionProfile !== 'cinematic' && req === 'cinematic') return 'compact';
  return req;
};

const normalizeVariant = (
  variant: MotionVariant,
  density: MotionDensity,
  conversionSafe: boolean,
): MotionVariant => {
  if (!supportsMotion) return 'none';
  if (conversionSafe && variant === 'legendary-scrub') return 'reveal-stagger';
  if (motionProfile === 'lite') {
    if (variant === 'legendary-scrub') return 'none';
    if (variant === 'story-stack') return 'reveal-stagger';
    return variant;
  }
  if (density === 'cinematic' && !supportsCinematicMotion) {
    if (variant === 'legendary-scrub') return 'none';
    if (variant === 'story-stack') return 'reveal-stagger';
  }
  return variant;
};

function animateRevealStagger(node: HTMLElement, density: MotionDensity) {
  const revealNodes = Array.from(node.querySelectorAll<HTMLElement>('.reveal'));
  if (!revealNodes.length) return;
  const cinematic = density === 'cinematic';
  gsap.fromTo(
    revealNodes,
    { y: cinematic ? 30 : 20, opacity: 0, filter: 'blur(6px)' },
    {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      duration: cinematic ? 0.82 : 0.62,
      stagger: cinematic ? 0.1 : 0.06,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: node,
        start: cinematic ? 'top 90%' : 'top 86%',
        toggleActions: 'play none none none',
      },
    },
  );
}

function animateStoryStack(node: HTMLElement, density: MotionDensity) {
  const cinematic = density === 'cinematic';
  const targets = Array.from(
    node.querySelectorAll<HTMLElement>(
      '.section-heading, .reveal, .testimonial-carousel-panel, .vendor-animata-scroll-stack-card',
    ),
  ).slice(0, 12);
  if (!targets.length) return;
  gsap.fromTo(
    targets,
    { y: cinematic ? 24 : 16, opacity: 0, scale: 0.992 },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: cinematic ? 0.78 : 0.58,
      stagger: cinematic ? 0.09 : 0.05,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: node,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    },
  );
}

function animateLegendaryScrub(node: HTMLElement, density: MotionDensity) {
  const cinematic = density === 'cinematic';
  if (!isDesktopViewport()) {
    animateRevealStagger(node, 'compact');
    return;
  }
  const scrubContainer = (node.querySelector('.container') || node) as HTMLElement;
  const scrubTargets = Array.from(
    node.querySelectorAll<HTMLElement>('.comparison-row, .reveal'),
  ).slice(0, 10);
  gsap
    .timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: node,
        start: 'top top',
        end: () => `+=${Math.round(window.innerHeight * (cinematic ? 1.25 : 1.05))}`,
        pin: true,
        scrub: cinematic ? 0.24 : 0.18,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          node.style.setProperty('--legend-progress', self.progress.toFixed(4));
        },
      },
    })
    .fromTo(scrubContainer, { y: 18, opacity: 0.86 }, { y: -10, opacity: 1, duration: 1 }, 0)
    .fromTo(
      scrubTargets,
      { y: 20, opacity: 0.66, filter: 'blur(4px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.06, duration: 0.8 },
      0.05,
    );
}

function applyParallaxDrift(
  node: HTMLElement,
  density: MotionDensity,
  conversionSafe: boolean,
  variant: MotionVariant,
) {
  if (!supportsMotion || !isDesktopViewport() || conversionSafe || variant === 'none') return;
  if (!node.getAttribute('data-motion-parallax') || node.hasAttribute('data-module-no-parallax'))
    return;
  const tier = node.getAttribute('data-motion-tier') || 'section';
  const base = tier === 'hero' ? -20 : tier === 'section' ? -12 : -6;
  const drift = density === 'cinematic' ? base : Math.round(base * 0.7);
  gsap.to(node, {
    y: drift,
    ease: 'none',
    scrollTrigger: { trigger: node, start: 'top bottom', end: 'bottom top', scrub: true },
  });
}

// ─── Run legacy variants ───────────────────────────────────────────────────────
if (supportsMotion) {
  const moduleNodes = Array.from(document.querySelectorAll<HTMLElement>('[data-module]'));
  moduleNodes.forEach((node) => {
    const density = resolveDensity(node);
    const conversionSafe = node.getAttribute('data-conversion-safe') === 'true';
    const requested = resolveVariant(node);
    const variant = normalizeVariant(requested, density, conversionSafe);
    if (variant === 'reveal-stagger') animateRevealStagger(node, density);
    else if (variant === 'story-stack') animateStoryStack(node, density);
    else if (variant === 'legendary-scrub') animateLegendaryScrub(node, density);
    applyParallaxDrift(node, density, conversionSafe, variant);
  });
}

// ─── New animation modules ────────────────────────────────────────────────────
initZoneTransitions();
initAmbientScroll();
initSplitText();
initStagger();
initScrollCounters();
initPathDraw();

// Desktop-only interactions
if (!prefersReducedMotion && hasFinePointer()) {
  initMagneticButtons();
  initTiltCards();
  initParallax();
}

// Final refresh
window.requestAnimationFrame(() => ScrollTrigger.refresh());

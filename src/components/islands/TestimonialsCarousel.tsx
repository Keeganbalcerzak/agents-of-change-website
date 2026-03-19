import { useEffect, useMemo, useState } from "react";
import type { SectionMotionVariant, SectionVisualVariant, Testimonial } from "@/lib/types";
import ScrollStackTestimonials from "@/components/vendor/animata/ScrollStackTestimonials";

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
  mode?: "carousel" | "scroll-stack";
  autoplayMs?: number;
  pauseOnHover?: boolean;
  visualVariant?: SectionVisualVariant;
  motionVariant?: SectionMotionVariant;
}

export default function TestimonialsCarousel({
  testimonials,
  mode = "carousel",
  autoplayMs = 7000,
  pauseOnHover = true,
  visualVariant = "default",
  motionVariant,
}: TestimonialsCarouselProps) {
  const resolvedMotionVariant = motionVariant ?? (mode === "scroll-stack" ? "story-stack" : "reveal-stagger");
  const featured = useMemo(
    () => testimonials.filter((testimonial) => testimonial.featured).slice(0, 5),
    [testimonials],
  );
  const cards = featured.length > 0 ? featured : testimonials.slice(0, 5);

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (cards.length <= 1 || mode !== "carousel" || (pauseOnHover && isPaused)) {
      return;
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      return;
    }

    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % cards.length);
    }, autoplayMs);

    return () => window.clearInterval(interval);
  }, [autoplayMs, cards.length, isPaused, mode, pauseOnHover]);

  function goTo(step: number) {
    if (step < 0) {
      setIndex(cards.length - 1);
      return;
    }

    if (step >= cards.length) {
      setIndex(0);
      return;
    }

    setIndex(step);
  }

  if (cards.length === 0) {
    return null;
  }

  if (mode === "scroll-stack") {
    return (
      <div
        className={
          visualVariant === "editorial-contrast-purple"
            ? "testimonial-stack-shell testimonial-stack-shell-editorial-purple"
            : "testimonial-stack-shell"
        }
        data-motion-variant={resolvedMotionVariant}
      >
        <ScrollStackTestimonials testimonials={cards} pauseOnHover={pauseOnHover} cadence="slow" />
      </div>
    );
  }

  return (
    <section
      className={
        visualVariant === "editorial-contrast-purple"
          ? "testimonial-carousel testimonial-carousel-editorial-purple"
          : "testimonial-carousel"
      }
      data-motion-variant={resolvedMotionVariant}
      aria-label="Featured student outcomes"
      onMouseEnter={() => {
        if (pauseOnHover) {
          setIsPaused(true);
        }
      }}
      onMouseLeave={() => {
        if (pauseOnHover) {
          setIsPaused(false);
        }
      }}
    >
      <div className="testimonial-carousel-panel">
        <article>
          <p className="testimonial-quote-mark" aria-hidden="true">
            "
          </p>
          <p className="testimonial-quote">{cards[index].quote}</p>
          <p className="testimonial-author">
            {cards[index].name} - {cards[index].examTrack} - {cards[index].state}
          </p>
          <p className="testimonial-result">{cards[index].result}</p>
        </article>
      </div>

      <div className="testimonial-controls">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          aria-label="Previous testimonial"
          className="carousel-button"
        >
          {"<"}
        </button>

        <div className="carousel-dots" role="tablist" aria-label="Testimonials">
          {cards.map((card, dotIndex) => (
            <button
              key={`${card.name}-${dotIndex}`}
              type="button"
              role="tab"
              aria-selected={dotIndex === index}
              aria-label={`Show testimonial ${dotIndex + 1}`}
              className={dotIndex === index ? "dot active" : "dot"}
              onClick={() => goTo(dotIndex)}
            />
          ))}
        </div>

        <button type="button" onClick={() => goTo(index + 1)} aria-label="Next testimonial" className="carousel-button">
          {">"}
        </button>
      </div>
    </section>
  );
}

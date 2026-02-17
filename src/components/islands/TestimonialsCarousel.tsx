import { useEffect, useMemo, useState } from "react";
import type { Testimonial } from "@/lib/types";

interface TestimonialsCarouselProps {
  testimonials: Testimonial[];
}

export default function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const featured = useMemo(
    () => testimonials.filter((testimonial) => testimonial.featured).slice(0, 5),
    [testimonials],
  );
  const cards = featured.length > 0 ? featured : testimonials.slice(0, 5);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (cards.length <= 1) {
      return;
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      return;
    }

    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % cards.length);
    }, 7000);

    return () => window.clearInterval(interval);
  }, [cards.length]);

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

  return (
    <section className="testimonial-carousel" aria-label="Featured student outcomes">
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

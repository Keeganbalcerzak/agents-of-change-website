import type { CSSProperties } from "react";
import type { Testimonial } from "@/lib/types";
import { stateCodeToName } from "@/lib/states";

interface ScrollStackTestimonialsProps {
  testimonials: Testimonial[];
  pauseOnHover?: boolean;
  cadence?: "balanced" | "slow";
}

export default function ScrollStackTestimonials({
  testimonials,
  pauseOnHover = true,
  cadence = "slow",
}: ScrollStackTestimonialsProps) {
  const cards = testimonials.slice(0, 6);
  if (cards.length === 0) {
    return null;
  }

  const loops = [...cards, ...cards];
  const duration = cadence === "slow" ? Math.max(42, cards.length * 9) : Math.max(34, cards.length * 7);

  return (
    <section
      className={pauseOnHover ? "vendor-animata-scroll-stack vendor-animata-scroll-stack-pausable" : "vendor-animata-scroll-stack"}
      aria-label="Scrolling student outcomes"
      style={{ "--stack-duration": `${duration}s` } as CSSProperties}
    >
      <div className="vendor-animata-scroll-stack-track">
        {loops.map((testimonial, index) => (
          <article
            className="story-card vendor-animata-scroll-stack-card"
            key={`${testimonial.name}-${testimonial.state}-${testimonial.examTrack}-${index}`}
            data-format-variant={index % 2 === 0 ? "quote-focus" : "result-focus"}
            style={{ "--stack-depth": `${(1 - (index % cards.length) * 0.035).toFixed(3)}` } as CSSProperties}
          >
            <p>{testimonial.quote}</p>
            <p className="story-author">
              {testimonial.name} - {testimonial.examTrack} - {stateCodeToName(testimonial.state)}
            </p>
            <p className="story-result">{testimonial.result}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

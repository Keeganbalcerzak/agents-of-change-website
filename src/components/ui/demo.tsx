import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Testimonial } from "@/lib/types";
import { getTestimonials } from "@/lib/content";

export const TestimonialsDemo = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    // In Astro, island components cannot always reliably access the same async context, 
    // but we can load content dynamically if needed, or pass it via props. 
    // Since this component is already marked `client:load` in astro, it shouldn't 
    // fetch data on the client if we can pass it down. 
    // However, default demo.tsx didn't take props. Let's fetch default testimonials to be safe.
    getTestimonials().then(setTestimonials);
  }, []);

  if (!testimonials.length) return null;

  const firstColumn = testimonials.slice(0, Math.ceil(testimonials.length / 3));
  const secondColumn = testimonials.slice(Math.ceil(testimonials.length / 3), Math.ceil((testimonials.length / 3) * 2));
  const thirdColumn = testimonials.slice(Math.ceil((testimonials.length / 3) * 2));

  return (
    <section className="section section-muted" style={{ paddingBlock: "var(--space-8)" }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="section-heading centered"
        >
          <p className="eyebrow">More stories</p>
          <h2>Continuous feedback</h2>
          <p>See what our recent enrollees have to say about the program.</p>
        </motion.div>

        <div 
          style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: "1.5rem", 
            marginTop: "2.5rem",
            maxHeight: "740px",
            overflow: "hidden",
            maskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)"
          }}
        >
          <TestimonialsColumn testimonials={firstColumn} duration={35} />
          <TestimonialsColumn testimonials={secondColumn} duration={45} style={{ display: "none" }} className="md-block" />
          <TestimonialsColumn testimonials={thirdColumn} duration={40} style={{ display: "none" }} className="lg-block" />
        </div>
      </div>
      <style>{`
        @media (min-width: 768px) {
          .md-block { display: block !important; }
        }
        @media (min-width: 1024px) {
          .lg-block { display: block !important; }
        }
      `}</style>
    </section>
  );
};

export default TestimonialsDemo;

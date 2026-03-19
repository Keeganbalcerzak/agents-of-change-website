"use client";

import React from "react";
import { motion } from "motion/react";
import type { Testimonial } from "@/lib/types";
import { stateCodeToName } from "@/lib/states";

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
  style?: React.CSSProperties;
}) => {
  return (
    <div className={props.className} style={props.style}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex-col-gap"
        style={{ display: "flex", flexDirection: "column", gap: "1.5rem", paddingBottom: "1.5rem" }}
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map((testimonial, i) => (
                <article
                  className="story-card"
                  key={i}
                  data-format-variant={i % 2 === 0 ? "quote-focus" : "result-focus"}
                  style={{ maxWidth: "320px", width: "100%" }}
                >
                  <p>{testimonial.quote}</p>
                  <p className="story-author">
                    {testimonial.name} - {testimonial.examTrack} - {stateCodeToName(testimonial.state)}
                  </p>
                  <p className="story-result">{testimonial.result}</p>
                </article>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};

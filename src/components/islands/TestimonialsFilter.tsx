import { useMemo, useState } from "react";
import type { ExamTrack, Testimonial } from "@/lib/types";
import { US_STATES, stateCodeToName } from "@/lib/states";
import { trackEvent } from "@/lib/analytics";

interface TestimonialsFilterProps {
  testimonials: Testimonial[];
}

const examOptions: Array<{ value: "all" | ExamTrack; label: string }> = [
  { value: "all", label: "All tracks" },
  { value: "LSW", label: "LSW" },
  { value: "LMSW", label: "LMSW" },
  { value: "LCSW", label: "LCSW" },
];

export default function TestimonialsFilter({ testimonials }: TestimonialsFilterProps) {
  const [examTrack, setExamTrack] = useState<"all" | ExamTrack>("all");
  const [state, setState] = useState("all");

  function handleFilter(type: string, value: string) {
    trackEvent("filter_interaction", {
      filter_type: type,
      filter_value: value,
      module: "success-stories-filter",
    });
  }

  const filtered = useMemo(
    () =>
      testimonials.filter((testimonial) => {
        const matchesExam = examTrack === "all" || testimonial.examTrack === examTrack;
        const matchesState = state === "all" || testimonial.state === state;
        return matchesExam && matchesState;
      }),
    [examTrack, state, testimonials],
  );

  return (
    <div className="testimonial-filter-layout">
      <form className="filter-bar" aria-label="Filter student stories" onSubmit={(event) => event.preventDefault()}>
        <label>
          <span>Exam track</span>
          <select
            value={examTrack}
            onChange={(event) => {
              const value = event.target.value as "all" | ExamTrack;
              setExamTrack(value);
              handleFilter("exam_track", value);
            }}
          >
            {examOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>State</span>
          <select
            value={state}
            onChange={(event) => {
              const value = event.target.value;
              setState(value);
              handleFilter("state", value);
            }}
          >
            <option value="all">All states</option>
            {US_STATES.map((stateOption) => (
              <option key={stateOption.code} value={stateOption.code}>
                {stateOption.name}
              </option>
            ))}
          </select>
        </label>
      </form>

      <p className="result-meta" aria-live="polite">
        {filtered.length} stories found
      </p>

      <div className="testimonial-grid">
        {filtered.length === 0 ? (
          <article className="story-card">
            <p>No stories match your current filters. Try a different state or exam track.</p>
          </article>
        ) : (
          filtered.map((testimonial, index) => (
            <article
              className="story-card"
              key={`${testimonial.name}-${testimonial.state}-${testimonial.examTrack}`}
              data-format-variant={index % 2 === 0 ? "quote-focus" : "result-focus"}
            >
              <p>{testimonial.quote}</p>
              <p className="story-author">
                {testimonial.name} - {testimonial.examTrack} - {stateCodeToName(testimonial.state)}
              </p>
              <p className="story-result">{testimonial.result}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

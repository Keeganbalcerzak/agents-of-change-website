import { useEffect, useMemo, useState } from "react";
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

function isExamTrack(value: string | null): value is ExamTrack {
  return Boolean(value && examOptions.some((option) => option.value === value));
}

function buildSearchDocument(testimonial: Testimonial): string {
  return [
    testimonial.name,
    testimonial.state,
    testimonial.examTrack,
    testimonial.quote,
    testimonial.result,
    stateCodeToName(testimonial.state),
  ]
    .join(" ")
    .toLowerCase();
}

function buildTrialHref(testimonial: Testimonial): string {
  const params = new URLSearchParams({
    step: "2",
    examTrack: testimonial.examTrack,
    state: testimonial.state,
  });

  return `/start-trial?${params.toString()}`;
}

export default function TestimonialsFilter({ testimonials }: TestimonialsFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [examTrack, setExamTrack] = useState<"all" | ExamTrack>("all");
  const [state, setState] = useState("all");
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [hasInitializedFilters, setHasInitializedFilters] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const nextSearch = params.get("q");
    const nextExamTrack = params.get("examTrack");
    const nextState = params.get("state");
    const nextFeatured = params.get("featured");

    if (nextSearch) {
      setSearchQuery(nextSearch);
    }

    if (isExamTrack(nextExamTrack)) {
      setExamTrack(nextExamTrack);
    }

    if (nextState && (nextState === "all" || US_STATES.some((stateOption) => stateOption.code === nextState))) {
      setState(nextState);
    }

    setFeaturedOnly(nextFeatured === "1");
    setHasInitializedFilters(true);
  }, []);

  useEffect(() => {
    if (!hasInitializedFilters || typeof window === "undefined") {
      return;
    }

    const nextUrl = new URL(window.location.href);

    if (searchQuery.trim()) {
      nextUrl.searchParams.set("q", searchQuery.trim());
    } else {
      nextUrl.searchParams.delete("q");
    }

    if (examTrack !== "all") {
      nextUrl.searchParams.set("examTrack", examTrack);
    } else {
      nextUrl.searchParams.delete("examTrack");
    }

    if (state !== "all") {
      nextUrl.searchParams.set("state", state);
    } else {
      nextUrl.searchParams.delete("state");
    }

    if (featuredOnly) {
      nextUrl.searchParams.set("featured", "1");
    } else {
      nextUrl.searchParams.delete("featured");
    }

    window.history.replaceState({}, "", nextUrl);
  }, [examTrack, featuredOnly, hasInitializedFilters, searchQuery, state]);

  function handleFilter(type: string, value: string) {
    trackEvent("filter_interaction", {
      filter_type: type,
      filter_value: value,
      module: "success-stories-filter",
    });
  }

  const filtered = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return testimonials.filter((testimonial) => {
      const matchesExam = examTrack === "all" || testimonial.examTrack === examTrack;
      const matchesState = state === "all" || testimonial.state === state;
      const matchesFeatured = !featuredOnly || Boolean(testimonial.featured);
      const matchesSearch = !normalizedQuery || buildSearchDocument(testimonial).includes(normalizedQuery);

      return matchesExam && matchesState && matchesFeatured && matchesSearch;
    });
  }, [examTrack, featuredOnly, searchQuery, state, testimonials]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || examTrack !== "all" || state !== "all" || featuredOnly;

  function resetFilters() {
    setSearchQuery("");
    setExamTrack("all");
    setState("all");
    setFeaturedOnly(false);
    handleFilter("reset", "all");
  }

  return (
    <div className="testimonial-filter-layout">
      <form className="filter-bar" aria-label="Filter student stories" onSubmit={(event) => event.preventDefault()}>
        <label style={{ gridColumn: "1 / -1" }}>
          <span>Search stories</span>
          <input
            type="search"
            value={searchQuery}
            placeholder="Try failed attempt, California, score improved..."
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>

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

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={featuredOnly}
          onChange={(event) => {
            setFeaturedOnly(event.target.checked);
            handleFilter("featured", event.target.checked ? "1" : "0");
          }}
        />
        <span>Show featured stories only</span>
      </label>

      {hasActiveFilters && (
        <div>
          <button type="button" className="button secondary" onClick={resetFilters}>
            Clear story filters
          </button>
        </div>
      )}

      <p className="result-meta" aria-live="polite">
        {filtered.length} stories found
      </p>

      <div className="testimonial-grid">
        {filtered.length === 0 ? (
          <article className="story-card">
            <p>No stories match your current filters. Try a different search, state, or track.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1rem" }}>
              <button type="button" className="button secondary" onClick={resetFilters}>
                Reset filters
              </button>
              <a className="button secondary" href="/start-trial">
                Start your plan
              </a>
            </div>
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
              <a className="button secondary" href={buildTrialHref(testimonial)} data-cta="story-plan-cta" data-cta-location={testimonial.state}>
                Build a similar plan
              </a>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

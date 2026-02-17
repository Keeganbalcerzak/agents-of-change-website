import { useMemo, useState } from "react";
import type { CECourse } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";

interface CeCatalogFilterProps {
  courses: CECourse[];
}

const categoryOptions = ["all", "Clinical", "Ethics", "Leadership", "Equity", "Macro Practice"];
const formatOptions: Array<"all" | CECourse["format"]> = ["all", "self-paced", "live"];

export default function CeCatalogFilter({ courses }: CeCatalogFilterProps) {
  const [category, setCategory] = useState("all");
  const [format, setFormat] = useState<"all" | CECourse["format"]>("all");
  const [audience, setAudience] = useState<CECourse["audience"] | "all">("all");

  const filteredCourses = useMemo(
    () =>
      courses.filter((course) => {
        const categoryMatch = category === "all" || course.category === category;
        const formatMatch = format === "all" || course.format === format;
        const audienceMatch = audience === "all" || course.audience === audience || course.audience === "all";

        return categoryMatch && formatMatch && audienceMatch;
      }),
    [audience, category, courses, format],
  );

  function logFilter(type: string, value: string) {
    trackEvent("filter_interaction", {
      filter_type: type,
      filter_value: value,
      module: "ce-catalog",
    });
  }

  return (
    <div className="ce-catalog-layout" data-module="ce-catalog" data-motion-tier="section">
      <form className="ce-filter-bar" onSubmit={(event) => event.preventDefault()} aria-label="Filter CE catalog">
        <label>
          <span>Category</span>
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              logFilter("category", event.target.value);
            }}
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All categories" : option}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Format</span>
          <select
            value={format}
            onChange={(event) => {
              const value = event.target.value as "all" | CECourse["format"];
              setFormat(value);
              logFilter("format", value);
            }}
          >
            {formatOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All formats" : option}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Audience</span>
          <select
            value={audience}
            onChange={(event) => {
              const value = event.target.value as CECourse["audience"] | "all";
              setAudience(value);
              logFilter("audience", value);
            }}
          >
            <option value="all">All audiences</option>
            <option value="LMSW">LMSW</option>
            <option value="LCSW">LCSW</option>
            <option value="LSW">LSW</option>
          </select>
        </label>
      </form>

      <p className="result-meta" aria-live="polite">
        {filteredCourses.length} courses shown
      </p>

      <div className="ce-grid">
        {filteredCourses.map((course) => (
          <article className="ce-card" key={course.id}>
            <p className="ce-meta">
              {course.category} | {course.ceHours} CE hours | {course.format}
            </p>
            <h3>{course.title}</h3>
            <p>{course.audience === "all" ? "Applies to all social work tracks" : `Best for ${course.audience} track`}</p>
            <a className="button secondary" href="/start-trial" data-cta="ce-course-cta" data-cta-location={course.id}>
              Add to my plan
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}

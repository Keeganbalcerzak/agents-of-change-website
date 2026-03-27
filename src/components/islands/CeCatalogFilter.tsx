import { useEffect, useMemo, useState } from "react";
import type { CECourse } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";

interface CeCatalogFilterProps {
  courses: CECourse[];
}

type CatalogSort = "recommended" | "hours_desc" | "hours_asc" | "title_asc";

const formatOptions: Array<"all" | CECourse["format"]> = ["all", "self-paced", "live"];
const audienceOptions: Array<CECourse["audience"] | "all"> = ["all", "LSW", "LMSW", "LCSW"];
const sortOptions: Array<{ value: CatalogSort; label: string }> = [
  { value: "recommended", label: "Recommended" },
  { value: "hours_desc", label: "Most CE hours" },
  { value: "hours_asc", label: "Fewest CE hours" },
  { value: "title_asc", label: "Title A-Z" },
];

function buildCourseSearchDocument(course: CECourse): string {
  return [course.title, course.category, course.format, course.audience, `${course.ceHours}`].join(" ").toLowerCase();
}

function buildTrialHref(course: CECourse, activeAudience: CECourse["audience"] | "all"): string {
  const params = new URLSearchParams();
  const audience = activeAudience !== "all" ? activeAudience : course.audience !== "all" ? course.audience : undefined;

  params.set("step", "2");

  if (audience) {
    params.set("examTrack", audience);
  }

  const queryString = params.toString();
  return queryString ? `/start-trial?${queryString}` : "/start-trial";
}

function isCatalogSort(value: string | null): value is CatalogSort {
  return Boolean(value && sortOptions.some((option) => option.value === value));
}

export default function CeCatalogFilter({ courses }: CeCatalogFilterProps) {
  const categoryOptions = useMemo(
    () => ["all", ...new Set(courses.map((course) => course.category).sort((left, right) => left.localeCompare(right)))],
    [courses],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [format, setFormat] = useState<"all" | CECourse["format"]>("all");
  const [audience, setAudience] = useState<CECourse["audience"] | "all">("all");
  const [sortBy, setSortBy] = useState<CatalogSort>("recommended");
  const [hasInitializedFilters, setHasInitializedFilters] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const nextCategory = params.get("category");
    const nextFormat = params.get("format");
    const nextAudience = params.get("audience");
    const nextSort = params.get("sort");
    const nextSearch = params.get("q");

    if (nextSearch) {
      setSearchQuery(nextSearch);
    }

    if (nextCategory && categoryOptions.includes(nextCategory)) {
      setCategory(nextCategory);
    }

    if (nextFormat && formatOptions.includes(nextFormat as "all" | CECourse["format"])) {
      setFormat(nextFormat as "all" | CECourse["format"]);
    }

    if (nextAudience && audienceOptions.includes(nextAudience as CECourse["audience"] | "all")) {
      setAudience(nextAudience as CECourse["audience"] | "all");
    }

    if (isCatalogSort(nextSort)) {
      setSortBy(nextSort);
    }

    setHasInitializedFilters(true);
  }, [categoryOptions]);

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

    if (category !== "all") {
      nextUrl.searchParams.set("category", category);
    } else {
      nextUrl.searchParams.delete("category");
    }

    if (format !== "all") {
      nextUrl.searchParams.set("format", format);
    } else {
      nextUrl.searchParams.delete("format");
    }

    if (audience !== "all") {
      nextUrl.searchParams.set("audience", audience);
    } else {
      nextUrl.searchParams.delete("audience");
    }

    if (sortBy !== "recommended") {
      nextUrl.searchParams.set("sort", sortBy);
    } else {
      nextUrl.searchParams.delete("sort");
    }

    window.history.replaceState({}, "", nextUrl);
  }, [audience, category, format, hasInitializedFilters, searchQuery, sortBy]);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const matchingCourses = courses.filter((course) => {
      const categoryMatch = category === "all" || course.category === category;
      const formatMatch = format === "all" || course.format === format;
      const audienceMatch = audience === "all" || course.audience === audience || course.audience === "all";
      const searchMatch = !normalizedQuery || buildCourseSearchDocument(course).includes(normalizedQuery);

      return categoryMatch && formatMatch && audienceMatch && searchMatch;
    });

    return [...matchingCourses].sort((left, right) => {
      switch (sortBy) {
        case "hours_desc":
          return right.ceHours - left.ceHours || left.title.localeCompare(right.title);
        case "hours_asc":
          return left.ceHours - right.ceHours || left.title.localeCompare(right.title);
        case "title_asc":
          return left.title.localeCompare(right.title);
        case "recommended":
        default: {
          const featuredDelta = Number(Boolean(right.featured)) - Number(Boolean(left.featured));
          if (featuredDelta !== 0) {
            return featuredDelta;
          }
          return left.title.localeCompare(right.title);
        }
      }
    });
  }, [audience, category, courses, format, searchQuery, sortBy]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || category !== "all" || format !== "all" || audience !== "all" || sortBy !== "recommended";

  function logFilter(type: string, value: string) {
    trackEvent("filter_interaction", {
      filter_type: type,
      filter_value: value,
      module: "ce-catalog",
    });
  }

  function resetFilters() {
    setSearchQuery("");
    setCategory("all");
    setFormat("all");
    setAudience("all");
    setSortBy("recommended");
    logFilter("reset", "all");
  }

  return (
    <div className="ce-catalog-layout" data-module="ce-catalog" data-motion-tier="section">
      <form className="ce-filter-bar" onSubmit={(event) => event.preventDefault()} aria-label="Filter CE catalog">
        <label style={{ gridColumn: "1 / -1" }}>
          <span>Search courses</span>
          <input
            type="search"
            value={searchQuery}
            placeholder="Try ethics, supervision, trauma, live..."
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>

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
            {audienceOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "All audiences" : option}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Sort by</span>
          <select
            value={sortBy}
            onChange={(event) => {
              const value = event.target.value as CatalogSort;
              setSortBy(value);
              logFilter("sort", value);
            }}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </form>

      {hasActiveFilters && (
        <div>
          <button type="button" className="button secondary" onClick={resetFilters}>
            Clear catalog filters
          </button>
        </div>
      )}

      <p className="result-meta" aria-live="polite">
        {filteredCourses.length} courses shown
      </p>

      <div className="ce-grid">
        {filteredCourses.length === 0 ? (
          <article className="ce-card">
            <p className="ce-meta">No matching CE courses</p>
            <h3>Broaden the filter set</h3>
            <p>Try a wider audience, remove the search term, or start from your state requirements instead.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1rem" }}>
              <button type="button" className="button secondary" onClick={resetFilters}>
                Reset filters
              </button>
              <a className="button secondary" href="/state-requirements">
                Check state requirements
              </a>
            </div>
          </article>
        ) : (
          filteredCourses.map((course) => (
            <article className="ce-card" key={course.id}>
              <p className="ce-meta">
                {course.category} | {course.ceHours} CE hours | {course.format}
              </p>
              <h3>{course.title}</h3>
              <p>{course.audience === "all" ? "Applies to all social work tracks" : `Best for ${course.audience} track`}</p>
              <a
                className="button secondary"
                href={buildTrialHref(course, audience)}
                data-cta="ce-course-cta"
                data-cta-location={course.id}
              >
                Add to CE plan
              </a>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

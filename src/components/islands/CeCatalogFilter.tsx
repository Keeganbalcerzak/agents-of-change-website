import { useEffect, useMemo, useState } from "react";
import type { CECourse } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";
import { US_STATES, stateCodeToName } from "@/lib/states";

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
const validStateCodes = new Set(US_STATES.map((entry) => entry.code));

function buildCourseSearchDocument(course: CECourse): string {
  return [course.title, course.category, course.format, course.audience, `${course.ceHours}`].join(" ").toLowerCase();
}

function normalizeStateCode(value: string | null): string {
  if (!value) {
    return "";
  }

  const normalized = value.trim().toUpperCase();
  return validStateCodes.has(normalized) ? normalized : "";
}

function buildStateRequirementsHref(stateCode: string): string {
  return stateCode ? `/state-requirements/${stateCode.toLowerCase()}` : "/state-requirements";
}

function buildCeSupportPath(audience: CECourse["audience"] | undefined, stateCode: string): string {
  const params = new URLSearchParams();

  if (audience) {
    params.set("examTrack", audience);
  }

  if (stateCode) {
    params.set("state", stateCode);
  }

  params.set("topic", "ce");

  const queryString = params.toString();
  return queryString ? `/contact?${queryString}` : "/contact?topic=ce";
}

function buildCeSupportHref(course: CECourse, activeAudience: CECourse["audience"] | "all", stateCode: string): string {
  const audience = activeAudience !== "all" ? activeAudience : course.audience !== "all" ? course.audience : undefined;
  return buildCeSupportPath(audience, stateCode);
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
  const [stateCode, setStateCode] = useState("");
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
    const nextStateCode = params.get("state");
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

    setStateCode(normalizeStateCode(nextStateCode));

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

    if (stateCode) {
      nextUrl.searchParams.set("state", stateCode);
    } else {
      nextUrl.searchParams.delete("state");
    }

    if (sortBy !== "recommended") {
      nextUrl.searchParams.set("sort", sortBy);
    } else {
      nextUrl.searchParams.delete("sort");
    }

    window.history.replaceState({}, "", nextUrl);
  }, [audience, category, format, hasInitializedFilters, searchQuery, sortBy, stateCode]);

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
    searchQuery.trim().length > 0 ||
    category !== "all" ||
    format !== "all" ||
    audience !== "all" ||
    stateCode !== "" ||
    sortBy !== "recommended";

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
    setStateCode("");
    setSortBy("recommended");
    logFilter("reset", "all");
  }

  const plannerTitle = stateCode
    ? `Plan CE for ${stateCodeToName(stateCode)} before you commit`
    : "Choose your state before you build a CE plan";
  const plannerDescription = stateCode
    ? "Use the state requirements page to confirm hour totals and renewal cadence, then carry that context into CE support for course selection."
    : "CE rules change by state. Add your state so the next step goes to the right board guidance and CE support path instead of leaving you to guess.";
  const plannerPrimaryHref = buildStateRequirementsHref(stateCode);
  const plannerPrimaryLabel = stateCode ? `Open ${stateCodeToName(stateCode)} requirements` : "Browse state requirements";
  const plannerSecondaryHref = buildCeSupportPath(audience === "all" ? undefined : audience, stateCode);
  const plannerSecondaryLabel = stateCode ? "Get CE guidance with my state" : "Contact CE team";

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
          <span>State</span>
          <select
            value={stateCode}
            onChange={(event) => {
              setStateCode(event.target.value);
              logFilter("state", event.target.value || "none");
            }}
          >
            <option value="">No state selected</option>
            {US_STATES.map((entry) => (
              <option key={entry.code} value={entry.code}>
                {entry.name}
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

      <article className="support-card ce-planner-card">
        <h3>{plannerTitle}</h3>
        <p>{plannerDescription}</p>
        <div className="ce-planner-actions">
          <a className="button secondary" href={plannerPrimaryHref}>
            {plannerPrimaryLabel}
          </a>
          <a className="button secondary" href={plannerSecondaryHref}>
            {plannerSecondaryLabel}
          </a>
        </div>
      </article>

      {hasActiveFilters && (
        <div>
          <button type="button" className="button secondary" onClick={resetFilters}>
            Clear catalog filters
          </button>
        </div>
      )}

      <p className="result-meta" aria-live="polite">
        {filteredCourses.length} courses shown{stateCode ? ` for ${stateCodeToName(stateCode)}` : ""}
      </p>

      <div className="ce-grid">
        {filteredCourses.length === 0 ? (
          <article className="ce-card">
            <p className="ce-meta">No matching CE courses</p>
            <h3>Broaden the filter set</h3>
            <p>Try a wider audience, remove the search term, or use the right state and CE support path instead.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1rem" }}>
              <button type="button" className="button secondary" onClick={resetFilters}>
                Reset filters
              </button>
              <a className="button secondary" href={plannerPrimaryHref}>
                {plannerPrimaryLabel}
              </a>
              <a className="button secondary" href={plannerSecondaryHref}>
                {plannerSecondaryLabel}
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
                href={buildCeSupportHref(course, audience, stateCode)}
                data-cta="ce-course-cta"
                data-cta-location={course.id}
              >
                Plan this course
              </a>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

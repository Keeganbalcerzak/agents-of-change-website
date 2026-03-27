import { useEffect, useMemo, useState } from "react";
import type { ResourceArticle } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";

interface ResourceLibraryProps {
  resources: ResourceArticle[];
}

function buildResourceSearchDocument(resource: ResourceArticle): string {
  return [resource.title, resource.category, resource.excerpt, resource.readTime].join(" ").toLowerCase();
}

function getResourceCta(resource: ResourceArticle): { href: string; label: string } {
  switch (resource.category) {
    case "Licensing":
      return { href: "/state-requirements", label: "Check state requirements" };
    case "Exam Tactics":
      return { href: "/exam-prep", label: "Review exam prep" };
    case "Recovery Strategy":
      return { href: "/start-trial?step=2", label: "Rebuild your study plan" };
    case "Study Strategy":
    default:
      return { href: "/start-trial?step=2", label: "Apply this strategy" };
  }
}

export default function ResourceLibrary({ resources }: ResourceLibraryProps) {
  const categoryOptions = useMemo(
    () => ["all", ...new Set(resources.map((resource) => resource.category).sort((left, right) => left.localeCompare(right)))],
    [resources],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [hasInitializedFilters, setHasInitializedFilters] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const nextSearch = params.get("q");
    const nextCategory = params.get("category");

    if (nextSearch) {
      setSearchQuery(nextSearch);
    }

    if (nextCategory && categoryOptions.includes(nextCategory)) {
      setCategory(nextCategory);
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

    window.history.replaceState({}, "", nextUrl);
  }, [category, hasInitializedFilters, searchQuery]);

  const filteredResources = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return resources.filter((resource) => {
      const categoryMatch = category === "all" || resource.category === category;
      const searchMatch = !normalizedQuery || buildResourceSearchDocument(resource).includes(normalizedQuery);
      return categoryMatch && searchMatch;
    });
  }, [category, resources, searchQuery]);

  const hasActiveFilters = searchQuery.trim().length > 0 || category !== "all";

  function logFilter(type: string, value: string) {
    trackEvent("filter_interaction", {
      filter_type: type,
      filter_value: value,
      module: "resource-library",
    });
  }

  function resetFilters() {
    setSearchQuery("");
    setCategory("all");
    logFilter("reset", "all");
  }

  return (
    <div className="testimonial-filter-layout">
      <form className="filter-bar" aria-label="Filter resources" onSubmit={(event) => event.preventDefault()}>
        <label>
          <span>Search resources</span>
          <input
            type="search"
            value={searchQuery}
            placeholder="Try licensing, rationale, failed attempt..."
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
      </form>

      {hasActiveFilters && (
        <div>
          <button type="button" className="button secondary" onClick={resetFilters}>
            Clear resource filters
          </button>
        </div>
      )}

      <p className="result-meta" aria-live="polite">
        {filteredResources.length} articles shown
      </p>

      <div className="resource-grid">
        {filteredResources.length === 0 ? (
          <article className="resource-card reveal">
            <p className="resource-meta">No matching resources</p>
            <h3>Try a broader search</h3>
            <p>Clear the filters or head to the state requirements hub if you need licensing-specific guidance next.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1rem" }}>
              <button type="button" className="button secondary" onClick={resetFilters}>
                Reset filters
              </button>
              <a href="/state-requirements" className="button secondary">
                Browse state guides
              </a>
            </div>
          </article>
        ) : (
          filteredResources.map((resource) => {
            const cta = getResourceCta(resource);

            return (
              <article className="resource-card reveal" key={resource.slug}>
                <p className="resource-meta">{resource.category} | {resource.readTime}</p>
                <h3>{resource.title}</h3>
                <p>{resource.excerpt}</p>
                <a href={cta.href} className="button secondary" data-cta="resource-next-step" data-cta-location={resource.slug}>
                  {cta.label}
                </a>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

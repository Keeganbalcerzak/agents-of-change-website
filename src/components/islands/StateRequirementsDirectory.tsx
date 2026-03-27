import { useEffect, useMemo, useState } from "react";
import type { StateRequirement } from "@/lib/types";

interface StateRequirementsDirectoryProps {
  states: StateRequirement[];
}

function buildSearchDocument(state: StateRequirement): string {
  return [
    state.stateName,
    state.stateCode,
    state.requirements.join(" "),
    state.ceNotes ?? "",
    `${state.ceHoursRequired ?? ""}`,
  ]
    .join(" ")
    .toLowerCase();
}

export default function StateRequirementsDirectory({ states }: StateRequirementsDirectoryProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") ?? "");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextUrl = new URL(window.location.href);
    const nextQuery = query.trim();

    if (nextQuery) {
      nextUrl.searchParams.set("q", nextQuery);
    } else {
      nextUrl.searchParams.delete("q");
    }

    window.history.replaceState({}, "", nextUrl);
  }, [query]);

  const sortedStates = useMemo(
    () => [...states].sort((left, right) => left.stateName.localeCompare(right.stateName)),
    [states],
  );

  const filteredStates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return sortedStates;
    }

    return sortedStates.filter((state) => buildSearchDocument(state).includes(normalizedQuery));
  }, [query, sortedStates]);

  return (
    <div>
      <form
        aria-label="Search state requirements"
        onSubmit={(event) => event.preventDefault()}
        style={{
          display: "grid",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <label htmlFor="state-directory-query" style={{ display: "grid", gap: "0.45rem" }}>
          <span style={{ fontWeight: 600 }}>Search by state, code, or requirement</span>
          <input
            id="state-directory-query"
            type="search"
            value={query}
            placeholder="Try California, NY, ethics, supervision..."
            onChange={(event) => setQuery(event.target.value)}
            style={{
              width: "100%",
              border: "1px solid rgba(26, 28, 38, 0.14)",
              borderRadius: "1rem",
              padding: "0.95rem 1rem",
              background: "rgba(255, 255, 255, 0.92)",
              color: "inherit",
            }}
          />
        </label>

        {query && (
          <div>
            <button type="button" className="button secondary" onClick={() => setQuery("")}>
              Clear search
            </button>
          </div>
        )}
      </form>

      <p className="result-meta" aria-live="polite">
        {filteredStates.length} state guides shown
      </p>

      <div className="state-grid">
        {filteredStates.map((state) => (
          <article className="state-card reveal" key={state.stateCode}>
            <h2>{state.stateName}</h2>
            <p>{state.requirements[0]}</p>
            <a href={`/state-requirements/${state.stateCode.toLowerCase()}`}>View {state.stateCode} details</a>
          </article>
        ))}

        {filteredStates.length === 0 && (
          <article className="state-card reveal">
            <h2>No matching state guide</h2>
            <p>Try a full state name, a two-letter code, or a requirement term like ethics or renewal.</p>
            <button type="button" className="button secondary" onClick={() => setQuery("")}>
              Show all states
            </button>
          </article>
        )}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import type { FaqItem } from "@/lib/types";

interface FAQAccordionProps {
  items: FaqItem[];
}

function buildFaqSearchDocument(item: FaqItem): string {
  return [item.question, item.answer].join(" ").toLowerCase();
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openQuestion, setOpenQuestion] = useState<string | null>(items[0]?.question ?? null);
  const [hasInitializedFilters, setHasInitializedFilters] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const nextSearch = params.get("q");

    if (nextSearch) {
      setSearchQuery(nextSearch);
    }

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

    window.history.replaceState({}, "", nextUrl);
  }, [hasInitializedFilters, searchQuery]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => buildFaqSearchDocument(item).includes(normalizedQuery));
  }, [items, searchQuery]);

  useEffect(() => {
    if (filteredItems.length === 0) {
      setOpenQuestion(null);
      return;
    }

    const stillOpen = filteredItems.some((item) => item.question === openQuestion);
    if (!stillOpen) {
      setOpenQuestion(filteredItems[0].question);
    }
  }, [filteredItems, openQuestion]);

  const hasActiveFilters = searchQuery.trim().length > 0;

  return (
    <div className="testimonial-filter-layout">
      <form className="filter-bar" role="search" aria-label="Search frequently asked questions" onSubmit={(event) => event.preventDefault()}>
        <label style={{ gridColumn: "1 / -1" }}>
          <span>Search answers</span>
          <input
            type="search"
            value={searchQuery}
            placeholder="Try mobile, free trial, CE credits, failed attempt..."
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
      </form>

      {hasActiveFilters && (
        <div>
          <button type="button" className="button secondary" onClick={() => setSearchQuery("")}>
            Clear FAQ search
          </button>
        </div>
      )}

      <p className="result-meta" aria-live="polite">
        {filteredItems.length} answers shown
      </p>

      {filteredItems.length === 0 ? (
        <article className="faq-item">
          <h3>No matching answer</h3>
          <p>Try a broader question or route the issue through contact if you need a direct response.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1rem" }}>
            <button type="button" className="button secondary" onClick={() => setSearchQuery("")}>
              Show all FAQs
            </button>
            <a className="button secondary" href="/contact">
              Contact support
            </a>
          </div>
        </article>
      ) : (
        <div className="faq-list" role="list">
          {filteredItems.map((item, index) => {
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-button-${index}`;
            const isOpen = openQuestion === item.question;

            return (
              <article className="faq-item" key={item.question} role="listitem">
                <h3>
                  <button
                    id={buttonId}
                    className="faq-question"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenQuestion(isOpen ? null : item.question)}
                    type="button"
                  >
                    <span>{item.question}</span>
                    <span aria-hidden="true" className="faq-symbol">
                      {isOpen ? "-" : "+"}
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  className="faq-answer"
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                >
                  <p>{item.answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

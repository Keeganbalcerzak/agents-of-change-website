import { useState } from "react";
import type { FaqItem } from "@/lib/types";

interface FAQAccordionProps {
  items: FaqItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="faq-list" role="list">
      {items.map((item, index) => {
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;
        const isOpen = openIndex === index;

        return (
          <article className="faq-item" key={panelId} role="listitem">
            <h3>
              <button
                id={buttonId}
                className="faq-question"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
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
  );
}

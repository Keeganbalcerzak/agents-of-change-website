import type { SeoMetadata } from "@/lib/types";

export function findSeoByKey(entries: SeoMetadata[], key: string): SeoMetadata | undefined {
  return entries.find((entry) => entry.key === key);
}

export function toFaqJsonLd(faqItems: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

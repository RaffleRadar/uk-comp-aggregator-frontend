import { CANONICAL_ORIGIN } from "@/lib/site";
import type { FaqEntry } from "@/lib/portable-text-faq";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "RaffleRadar",
    url: CANONICAL_ORIGIN,
    logo: `${CANONICAL_ORIGIN}/logo-light.svg`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OperatorJsonLd({
  name,
  url,
  slug,
  logoUrl,
  description,
  companyNumber,
  foundedYear,
  sameAs,
  ratingValue,
}: {
  name: string;
  url: string | null;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  companyNumber: string | null;
  foundedYear: number | null;
  sameAs: string[];
  ratingValue: number | null;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: `${CANONICAL_ORIGIN}/operators/${slug}`,
  };

  if (logoUrl) {
    data.logo = logoUrl;
  }
  if (description) {
    data.description = description;
  }
  if (foundedYear !== null && Number.isFinite(foundedYear)) {
    data.foundingDate = String(foundedYear);
  }
  if (companyNumber) {
    data.identifier = companyNumber;
  }
  const sameAsList: string[] = [];
  if (url) {
    sameAsList.push(url);
  }
  sameAsList.push(...sameAs);
  if (sameAsList.length) {
    data.sameAs = sameAsList;
  }
  if (ratingValue !== null && Number.isFinite(ratingValue)) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue,
      bestRating: 5,
      ratingCount: 1,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebSiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "RaffleRadar",
    url: CANONICAL_ORIGIN,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${CANONICAL_ORIGIN}/competitions?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FaqPageJsonLd({ entries }: { entries: FaqEntry[] }) {
  if (entries.length === 0) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

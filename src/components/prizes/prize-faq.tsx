import type { PrizePageFaq } from "@/sanity/prize-pages";

export function PrizeFaq({ faqs }: { faqs: PrizePageFaq[] }) {
  if (faqs.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <section aria-labelledby="prize-faq-title" className="container pb-8">
      <div className="mx-auto max-w-[1100px]">
        <h2
          id="prize-faq-title"
          className="mb-4 text-xl font-semibold leading-tight tracking-[-0.02em] text-rr-primary md:text-2xl"
        >
          Frequently asked questions
        </h2>
        <dl className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.key}>
              <dt className="text-base font-medium text-rr-primary">
                {faq.question}
              </dt>
              <dd className="mt-1 text-sm leading-6 text-rr-secondary">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </div>
    </section>
  );
}

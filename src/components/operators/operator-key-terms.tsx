import Link from "next/link";
import type { OperatorKeyTerm } from "@/types/operator-profile";

type OperatorKeyTermsProps = {
  terms: OperatorKeyTerm[];
  operatorName: string;
  termsUrl?: string | null;
  headingClassName: string;
};

type DisplayTerm = {
  key: string;
  title: string;
  summary: string | null;
  clause: string | null;
  whyItMatters: string | null;
};

function possessive(name: string) {
  return /s$/i.test(name) ? `${name}’` : `${name}’s`;
}

function clean(value?: string | null) {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toDisplayTerms(terms: OperatorKeyTerm[]): DisplayTerm[] {
  return terms.flatMap((term, index) => {
    const title = clean(term.title);

    if (!title) return [];

    return [
      {
        key: term._key ?? `term-${index}`,
        title,
        summary: clean(term.summary),
        clause: clean(term.clause),
        whyItMatters: clean(term.whyItMatters),
      },
    ];
  });
}

function TermNumber({ value }: { value: number }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rr-green text-sm font-semibold text-rr-on-accent">
      {value}
    </span>
  );
}

function CardLabel({ children }: { children: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rr-green">
      {children}
    </p>
  );
}

function ClauseBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-rr-green-border bg-rr-green-bg px-2 py-1 text-xs font-medium leading-4 text-rr-green">
      {value}
    </span>
  );
}

export function OperatorKeyTerms({
  terms,
  operatorName,
  termsUrl,
  headingClassName,
}: OperatorKeyTermsProps) {
  const items = toDisplayTerms(terms);

  if (items.length === 0) return null;

  const count = items.length;
  const clauseWord = count === 1 ? "clause" : "clauses";
  const listHeading =
    count === 1 ? "Top unfavourable term" : `Top ${count} unfavourable terms`;
  const listSubheading =
    count === 1
      ? "The most important term to be aware of, based on its potential impact on entrants."
      : `The ${count} most important terms to be aware of, based on their potential impact on entrants.`;

  return (
    <section className="rounded-xl border border-rr-border bg-rr-surface p-4 md:p-5">
      <h2 className={headingClassName}>Terms worth knowing about</h2>
      <div className="mt-3 space-y-3 text-sm leading-6 text-rr-secondary">
        <p>
          We&apos;ve highlighted {count} {clauseWord} in {possessive(operatorName)} terms
          that entrants may want to be aware of before entering. Like many competition
          operators, their terms are primarily designed to protect the business, and
          similar clauses are common across the industry.
        </p>
        <p>
          Highlighting these terms doesn&apos;t necessarily mean they&apos;re unfair,
          unlawful or unusual. It&apos;s simply about helping entrants understand the
          conditions before taking part.
        </p>
      </div>

      <h3 className="mt-6 text-base font-semibold text-rr-primary">{listHeading}</h3>
      <p className="mt-1 text-sm text-rr-muted">{listSubheading}</p>

      <div className="mt-4 hidden overflow-hidden rounded-lg border border-rr-border lg:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-rr-elevated">
            <tr className="text-[11px] uppercase tracking-[0.14em] text-rr-muted">
              <th scope="col" className="w-12 px-4 py-3 font-medium">
                #
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Term (summary)
              </th>
              <th scope="col" className="w-48 px-4 py-3 font-medium">
                Section in T&amp;Cs
              </th>
              <th scope="col" className="w-[32%] px-4 py-3 font-medium">
                Why it matters
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.key} className="border-t border-rr-border align-top">
                <td className="px-4 py-4">
                  <TermNumber value={index + 1} />
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-rr-primary">{item.title}</p>
                  {item.summary ? (
                    <p className="mt-1 leading-6 text-rr-secondary">{item.summary}</p>
                  ) : null}
                </td>
                <td className="px-4 py-4">
                  {item.clause ? <ClauseBadge value={item.clause} /> : null}
                </td>
                <td className="px-4 py-4 leading-6 text-rr-secondary">
                  {item.whyItMatters}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ol className="mt-4 space-y-3 lg:hidden">
        {items.map((item, index) => (
          <li
            key={item.key}
            className="rounded-lg border border-rr-border bg-rr-elevated p-4"
          >
            <div className="flex items-start gap-3">
              <TermNumber value={index + 1} />
              <div className="min-w-0 flex-1">
                <CardLabel>Term (summary)</CardLabel>
                <p className="mt-1 text-sm font-semibold leading-6 text-rr-primary">
                  {item.title}
                </p>
                {item.summary ? (
                  <p className="mt-1 text-sm leading-6 text-rr-secondary">{item.summary}</p>
                ) : null}
              </div>
            </div>
            {item.clause ? (
              <div className="mt-3 border-t border-rr-border pt-3">
                <CardLabel>Section in T&amp;Cs</CardLabel>
                <div className="mt-2">
                  <ClauseBadge value={item.clause} />
                </div>
              </div>
            ) : null}
            {item.whyItMatters ? (
              <div className="mt-3 border-t border-rr-border pt-3">
                <CardLabel>Why it matters</CardLabel>
                <p className="mt-1 text-sm leading-6 text-rr-secondary">
                  {item.whyItMatters}
                </p>
              </div>
            ) : null}
          </li>
        ))}
      </ol>

      <div className="mt-4 rounded-lg border border-rr-border bg-rr-elevated px-4 py-3 text-sm leading-6 text-rr-secondary">
        <span className="mr-2 font-semibold uppercase tracking-[0.12em] text-rr-green">
          Please note
        </span>
        This is a summary of the key terms, not a full list. We recommend reading the full
        terms and conditions on the operator&apos;s website for complete details.
      </div>

      {termsUrl ? (
        <Link
          href={termsUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-rr-green px-4 text-sm font-medium text-rr-on-accent no-underline transition-opacity hover:opacity-90 sm:w-auto"
        >
          Read the full terms and conditions
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M14 4h6v6" />
            <path d="M20 4l-9 9" />
            <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
          </svg>
        </Link>
      ) : null}
    </section>
  );
}

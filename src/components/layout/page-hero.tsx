import type { CSSProperties, ReactNode } from "react";

export const PAGE_HERO_TITLE_CLASS =
  "text-2xl font-medium leading-[1.1] tracking-[-0.03em] text-rr-primary md:text-5xl md:leading-[1.05]";

type PageHeroProps = {
  id?: string;
  eyebrow?: ReactNode;
  title?: ReactNode;
  titleId?: string;
  titleStyle?: CSSProperties;
  heading?: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
};

export function PageHero({
  id,
  eyebrow,
  title,
  titleId,
  titleStyle,
  heading,
  lead,
  children,
}: PageHeroProps) {
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className="bg-gradient-to-b from-rr-surface to-rr-bg"
    >
      <div className="container py-8 md:py-14">
        <div className="mx-auto max-w-[1100px]">
          {eyebrow ? (
            <p className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-rr-green md:mb-4">
              <span aria-hidden="true" className="h-px w-8 shrink-0 bg-rr-green" />
              <span>{eyebrow}</span>
            </p>
          ) : null}

          {heading ?? (
            <h1 id={titleId} className={PAGE_HERO_TITLE_CLASS} style={titleStyle}>
              {title}
            </h1>
          )}

          {lead ? (
            <p className="mt-3 max-w-[800px] text-sm leading-6 text-rr-secondary md:mt-6 md:text-lg md:leading-7">
              {lead}
            </p>
          ) : null}

          {children}
        </div>
      </div>
    </section>
  );
}

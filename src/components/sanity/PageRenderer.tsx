import type { ReactNode } from "react";
import Link from "next/link";
import { IconArrowRight, IconInfoCircle } from "@tabler/icons-react";
import { titleColorVar } from "@/lib/titleColor";
import { Button } from "@/components/ui/button";
import { CalloutBlock } from "./blocks/CalloutBlock";
import { CardsBlock } from "./blocks/CardsBlock";
import { CategoryNavBlock } from "./blocks/CategoryNavBlock";
import { CompetitionListBlock } from "./blocks/CompetitionListBlock";
import { OperatorsBlock } from "./blocks/OperatorsBlock";
import { RichTextBlock } from "./blocks/RichTextBlock";
import { StatsBlock } from "./blocks/StatsBlock";
import { StepsBlock } from "./blocks/StepsBlock";
import { RichTitle } from "./RichTitle";

type CtaLink = {
  label: string;
  href: string;
};

type BaseSection = {
  _key?: string;
  _type: string;
} & Record<string, unknown>;

type PageData = {
  title: string;
  heroEyebrow?: string;
  heroHeading: string;
  richTitle?: unknown[] | null;
  heroHeadingColor?: string | null;
  heroLead?: string;
  heroCtaPrimary?: CtaLink;
  heroCtaSecondary?: CtaLink;
  sections?: BaseSection[];
};

function CtaButton({
  href,
  label,
  variant,
  icon,
}: {
  href: string;
  label: string;
  variant: "primary" | "secondary";
  icon: ReactNode;
}) {
  return (
    <Link href={href}>
      <Button variant={variant} className="h-10 rounded-md px-4 text-sm font-medium">
        {icon}
        {label}
      </Button>
    </Link>
  );
}

export function PageRenderer({ page }: { page: PageData }) {
  const sections = page.sections ?? [];
  const headingColor = titleColorVar(page.heroHeadingColor);
  const hasRichTitle = Array.isArray(page.richTitle) && page.richTitle.length > 0;

  return (
    <main className="bg-rr-bg">
      <section className="bg-gradient-to-b from-rr-surface to-rr-bg">
        <div className="container py-14 md:py-16">
          <div className="mx-auto max-w-[760px] text-center">
            {page.heroEyebrow ? (
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.18em] text-rr-green">
                {page.heroEyebrow}
              </p>
            ) : null}

            {hasRichTitle ? (
              <RichTitle
                value={page.richTitle}
                as="h1"
                className="text-4xl font-medium leading-tight tracking-[-0.03em] text-rr-primary md:text-5xl"
              />
            ) : (
              <h1
                className="text-4xl font-medium leading-tight tracking-[-0.03em] text-rr-primary md:text-5xl"
                style={headingColor ? { color: headingColor } : undefined}
              >
                {page.heroHeading}
              </h1>
            )}

            {page.heroLead ? (
              <p className="mx-auto mt-5 max-w-[680px] text-base leading-7 text-rr-secondary md:text-lg">
                {page.heroLead}
              </p>
            ) : null}

            {page.heroCtaPrimary || page.heroCtaSecondary ? (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {page.heroCtaPrimary ? (
                  <CtaButton
                    href={page.heroCtaPrimary.href}
                    label={page.heroCtaPrimary.label}
                    variant="primary"
                    icon={<IconArrowRight size={16} />}
                  />
                ) : null}

                {page.heroCtaSecondary ? (
                  <CtaButton
                    href={page.heroCtaSecondary.href}
                    label={page.heroCtaSecondary.label}
                    variant="secondary"
                    icon={<IconInfoCircle size={16} />}
                  />
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {sections.map((section, index) => {
        const key = section._key ?? `${section._type}-${index}`;

        switch (section._type) {
          case "richTextBlock":
            return <RichTextBlock key={key} block={section} />;
          case "statsBlock":
            return <StatsBlock key={key} block={section} />;
          case "cardsBlock":
            return <CardsBlock key={key} block={section} />;
          case "stepsBlock":
            return <StepsBlock key={key} block={section} />;
          case "calloutBlock":
            return <CalloutBlock key={key} block={section} />;
          case "operatorsBlock":
            return <OperatorsBlock key={key} block={section} />;
          case "competitionListBlock":
            return <CompetitionListBlock key={key} block={section} />;
          case "categoryNavBlock":
            return <CategoryNavBlock key={key} block={section} />;
          default:
            return null;
        }
      })}
    </main>
  );
}

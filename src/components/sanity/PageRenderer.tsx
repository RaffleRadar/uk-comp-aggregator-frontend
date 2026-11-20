import type { ReactNode } from "react";
import { ScrollTopLink } from "@/components/ui/scroll-top-link";
import { IconArrowRight, IconInfoCircle } from "@tabler/icons-react";
import { titleColorVar } from "@/lib/titleColor";
import { Button } from "@/components/ui/button";
import { PageHero, PAGE_HERO_TITLE_CLASS } from "@/components/layout/page-hero";
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
    <ScrollTopLink href={href}>
      <Button variant={variant} className="h-10 rounded-md px-4 text-sm font-medium">
        {icon}
        {label}
      </Button>
    </ScrollTopLink>
  );
}

export function PageRenderer({ page }: { page: PageData }) {
  const sections = page.sections ?? [];
  const headingColor = titleColorVar(page.heroHeadingColor);
  const hasRichTitle = Array.isArray(page.richTitle) && page.richTitle.length > 0;

  return (
    <main className="bg-rr-bg">
      <PageHero
        eyebrow={page.heroEyebrow}
        heading={
          hasRichTitle ? (
            <RichTitle value={page.richTitle} as="h1" className={PAGE_HERO_TITLE_CLASS} />
          ) : undefined
        }
        title={page.heroHeading}
        titleStyle={headingColor ? { color: headingColor } : undefined}
        lead={page.heroLead}
      >
        {page.heroCtaPrimary || page.heroCtaSecondary ? (
          <div className="mt-6 flex flex-wrap items-center gap-3 md:mt-8">
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
      </PageHero>

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

import { RichTitle } from "@/components/sanity/RichTitle";
import {
  IconChartArcs,
  IconCircleDot,
  IconEye,
  IconFilterCog,
  IconMessageCircle,
  IconRadar2,
  IconScale,
  IconShieldCheck,
} from "@tabler/icons-react";

type CardItem = {
  _key?: string;
  icon: string;
  title: string;
  body: string;
};

type CardsBlockData = {
  _key?: string;
  _type?: string;
  eyebrow?: string;
  heading?: string;
  richTitle?: unknown[];
  items?: CardItem[];
};

const iconMap = {
  "radar-2": IconRadar2,
  "chart-arcs": IconChartArcs,
  "filter-cog": IconFilterCog,
  "shield-check": IconShieldCheck,
  eye: IconEye,
  scale: IconScale,
  "message-circle": IconMessageCircle,
} as const;

export function CardsBlock({ block }: { block: CardsBlockData }) {
  const items = block.items ?? [];
  const hasRichTitle = Array.isArray(block.richTitle) && block.richTitle.length > 0;

  if ((!block.heading && !hasRichTitle) || !items.length) {
    return null;
  }

  return (
    <section className="py-14">
      <div className="container">
        <div className="mx-auto max-w-[880px]">
          {block.eyebrow ? (
            <p className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-rr-green">
              <span className="h-px w-6 bg-rr-green" />
              {block.eyebrow}
            </p>
          ) : null}

          {hasRichTitle ? (
            <RichTitle
              value={block.richTitle}
              as="h2"
              className="max-w-[680px] text-3xl font-medium leading-tight tracking-[-0.03em] text-rr-primary"
            />
          ) : (
            <h2 className="max-w-[680px] text-3xl font-medium leading-tight tracking-[-0.03em] text-rr-primary">
              {block.heading}
            </h2>
          )}

          <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap] ?? IconCircleDot;

              return (
                <article
                  key={item._key ?? `${item.title}-${index}`}
                  className="rounded-xl border border-rr-border bg-rr-surface px-6 py-6"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-rr-green-border bg-rr-green-bg text-rr-green">
                    <Icon size={20} />
                  </div>
                  <h3 className="mb-2 text-base font-medium tracking-[-0.02em] text-rr-primary">
                    {item.title}
                  </h3>
                  <p className="whitespace-pre-line text-sm leading-6 text-rr-secondary">{item.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

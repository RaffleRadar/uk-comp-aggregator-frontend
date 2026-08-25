import { RichTitle } from "@/components/sanity/RichTitle";

type StepItem = {
  _key?: string;
  title: string;
  body: string;
};

type StepsBlockData = {
  _key?: string;
  _type?: string;
  eyebrow?: string;
  heading?: string;
  richTitle?: unknown[];
  items?: StepItem[];
};

export function StepsBlock({ block }: { block: StepsBlockData }) {
  const items = block.items ?? [];
  const hasRichTitle = Array.isArray(block.richTitle) && block.richTitle.length > 0;

  if ((!block.heading && !hasRichTitle) || !items.length) {
    return null;
  }

  return (
    <section className="py-7">
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

          <div className="mt-9">
            {items.map((item, index) => (
              <div
                key={item._key ?? `${item.title}-${index}`}
                className="flex gap-4 pb-8 last:pb-0"
              >
                <div className="flex shrink-0 flex-col items-center">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rr-green text-xs font-semibold text-rr-on-accent">
                    {index + 1}
                  </div>
                  {index < items.length - 1 ? <div className="mt-2 h-full w-px bg-rr-border" /> : null}
                </div>

                <div className="pb-1">
                  <h3 className="mb-2 text-base font-medium tracking-[-0.02em] text-rr-primary">
                    {item.title}
                  </h3>
                  <p className="whitespace-pre-line text-sm leading-6 text-rr-secondary">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

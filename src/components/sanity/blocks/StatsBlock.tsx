type StatsItem = {
  _key?: string;
  number: string;
  label: string;
};

type StatsBlockData = {
  _key?: string;
  _type?: string;
  items?: StatsItem[];
};

export function StatsBlock({ block }: { block: StatsBlockData }) {
  const items = block.items ?? [];

  if (!items.length) {
    return null;
  }

  return (
    <section className="pb-7">
      <div className="container">
        <div className="mx-auto grid max-w-[880px] grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((item, index) => (
            <div
              key={item._key ?? `${item.label}-${index}`}
              className="rounded-xl border border-rr-border bg-rr-surface px-5 py-5"
            >
              <p className="text-3xl font-medium leading-none tracking-[-0.03em] text-rr-green">
                {item.number}
              </p>
              <p className="mt-2 text-sm text-rr-secondary">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

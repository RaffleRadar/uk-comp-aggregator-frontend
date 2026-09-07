type CalloutBlockData = {
  _key?: string;
  _type?: string;
  quote?: string;
  attribution?: string;
};

export function CalloutBlock({ block }: { block: CalloutBlockData }) {
  if (!block.quote) {
    return null;
  }

  return (
    <section className="py-3">
      <div className="container">
        <div className="mx-auto max-w-[1100px]">
          <div className="rounded-xl border border-rr-border border-l-[3px] border-l-rr-green bg-rr-surface px-7 py-6">
            <p className="text-lg leading-8 tracking-[-0.02em] text-rr-primary">
              “{block.quote}”
            </p>
            {block.attribution ? (
              <p className="mt-4 text-sm font-medium text-rr-secondary">{block.attribution}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

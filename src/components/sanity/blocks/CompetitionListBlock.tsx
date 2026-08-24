import { CompetitionGrid } from "@/components/competitions/competition-grid";

type CompetitionListBlockData = {
  _key?: string;
  _type?: string;
  eyebrow?: string;
  heading?: string;
  category?: string;
  closing?: string;
  sortBy?: string;
  sortOrder?: string;
  excludeGames?: boolean;
  emptyMessage?: string;
};

export function CompetitionListBlock({
  block,
}: {
  block: CompetitionListBlockData;
}) {
  const category = block.category?.trim() || undefined;
  const closing = block.closing?.trim() || undefined;
  const sortOrder = block.sortOrder === "asc" ? "asc" : "desc";

  return (
    <section className="py-10 md:py-12">
      <div className="container">
        {block.eyebrow ? (
          <p className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-rr-green">
            <span className="h-px w-6 bg-rr-green" />
            {block.eyebrow}
          </p>
        ) : null}

        {block.heading ? (
          <h2 className="mb-6 max-w-[680px] text-3xl font-medium leading-tight tracking-[-0.03em] text-rr-primary">
            {block.heading}
          </h2>
        ) : null}

        <CompetitionGrid
          params={{
            category,
            closing,
            sortBy: block.sortBy || "valueRatio",
            sortOrder,
            excludeGames: block.excludeGames ?? false,
          }}
        />
      </div>
    </section>
  );
}

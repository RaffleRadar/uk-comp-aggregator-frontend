import Link from "next/link";
import { sanityClient } from "@/sanity/client";

type CategoryNavBlockData = {
  _key?: string;
  _type?: string;
  heading?: string;
};

type NavPage = {
  slug: string;
  label: string;
};

const CATEGORY_NAV_PAGES = `*[_type == "page" && showInCategoryNav == true && defined(slug.current)] | order(coalesce(navLabel, title) asc){
  "slug": slug.current,
  "label": coalesce(navLabel, title)
}`;

export async function CategoryNavBlock({
  block,
}: {
  block: CategoryNavBlockData;
}) {
  let pages: NavPage[] = [];

  try {
    const rows = await sanityClient.fetch<NavPage[]>(CATEGORY_NAV_PAGES);
    pages = Array.isArray(rows) ? rows.filter((row) => Boolean(row?.slug)) : [];
  } catch {
    pages = [];
  }

  if (pages.length === 0) {
    return null;
  }

  return (
    <section className="py-10 md:py-12">
      <div className="container">
        <h2 className="mb-4 text-xl font-medium tracking-[-0.02em] text-rr-primary">
          {block.heading || "Browse by category"}
        </h2>

        <div className="flex flex-wrap gap-2">
          {pages.map((page) => (
            <Link
              key={page.slug}
              href={`/${page.slug}`}
              className="inline-flex items-center rounded-full border border-rr-border bg-rr-surface px-3 py-1.5 text-sm text-rr-secondary transition hover:bg-rr-elevated hover:text-rr-primary"
            >
              {page.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

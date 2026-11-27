import { Fragment } from "react";
import { IconChevronRight } from "@tabler/icons-react";
import { ScrollTopLink } from "@/components/ui/scroll-top-link";
import { cn } from "@/lib/cn";
import { CANONICAL_ORIGIN } from "@/lib/site";

export type BreadcrumbLink = {
  label: string;
  href: string;
};

type BreadcrumbsProps = {
  parents: BreadcrumbLink[];
  current: BreadcrumbLink;
  className?: string;
};

const HOME: BreadcrumbLink = { label: "Home", href: "/" };

function absoluteUrl(href: string): string {
  if (/^https?:\/\//i.test(href)) {
    return href;
  }

  return `${CANONICAL_ORIGIN}${href.startsWith("/") ? href : `/${href}`}`;
}

export function buildBreadcrumbJsonLd(
  parents: BreadcrumbLink[],
  current: BreadcrumbLink,
) {
  const trail = [HOME, ...parents, current];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((link, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: link.label,
      item: absoluteUrl(link.href),
    })),
  };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function Breadcrumbs({ parents, current, className }: BreadcrumbsProps) {
  const visible = [HOME, ...parents];
  const jsonLd = buildBreadcrumbJsonLd(parents, current);

  return (
    <>
      <nav aria-label="Breadcrumb" className={cn("text-xs", className)}>
        <ol className="flex flex-wrap items-center gap-1 text-rr-muted">
          {visible.map((link, index) => (
            <Fragment key={link.href}>
              {index > 0 ? (
                <li aria-hidden="true" className="flex items-center">
                  <IconChevronRight size={12} />
                </li>
              ) : null}
              <li>
                <ScrollTopLink
                  href={link.href}
                  className="text-rr-muted no-underline transition-colors hover:text-rr-green"
                >
                  {link.label}
                </ScrollTopLink>
              </li>
            </Fragment>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
    </>
  );
}

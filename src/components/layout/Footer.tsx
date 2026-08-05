import Image from "next/image";
import Link from "next/link";
import { sanityClient } from "@/sanity/client";
import { SITE_SETTINGS } from "@/sanity/queries";

type FooterLink = {
  label: string;
  href: string;
};

type FooterColumn = {
  heading?: string | null;
  links?: FooterLink[] | null;
};

type SiteSettingsData = {
  footerColumns?: FooterColumn[] | null;
  footerLinks?: FooterLink[] | null;
  footerCopyright?: string | null;
  footerDisclaimer?: string | null;
  footerTagline?: string | null;
};

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

export async function Footer() {
  let settings: SiteSettingsData | null = null;

  try {
    settings = await sanityClient.fetch<SiteSettingsData | null>(
      SITE_SETTINGS,
      {},
      { next: { revalidate: 3600 } },
    );
  } catch {
    settings = null;
  }

  const footerColumns =
    settings?.footerColumns?.filter((column) => (column.links?.length ?? 0) > 0) ?? [];

  const fallbackColumns =
    footerColumns.length === 0 && settings?.footerLinks?.length
      ? [
          {
            heading: null,
            links: settings.footerLinks,
          },
        ]
      : [];

  const columns = footerColumns.length ? footerColumns : fallbackColumns;
  const currentYear = new Date().getFullYear();
  const footerCopyright =
    settings?.footerCopyright?.trim() || `© ${currentYear} RaffleRadar. All rights reserved.`;
  const footerDisclaimer = settings?.footerDisclaimer?.trim() || "";
  const footerTagline =
    settings?.footerTagline?.trim() ||
    "Track every UK prize competition in one place — real odds, real value, no noise.";

  return (
    <footer className="mt-20 border-t border-rr-border bg-rr-bg">
      <div className="container py-14 md:py-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <div className="max-w-[320px]">
            <Link
              href="/"
              className="inline-flex items-end gap-3.5 text-rr-primary no-underline"
              aria-label="RaffleRadar home"
            >
              <Image
                src="/favnew.svg"
                alt="RaffleRadar"
                width={68}
                height={68}
                className="h-16 w-16 shrink-0 md:h-[68px] md:w-[68px]"
                priority
              />
              <span className="text-lg font-semibold leading-none tracking-[-0.4px] md:text-xl">
                RAFFLE<span className="text-rr-green">RADAR</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-6 text-rr-muted">
              {footerTagline}
            </p>
          </div>

          {columns.length ? (
            <div className="w-full lg:w-auto">
              {/* Desktop / tablet: open columns */}
              <div className="hidden gap-10 sm:grid sm:grid-cols-2 lg:grid-cols-3 lg:gap-14">
                {columns.map((column, index) => (
                  <div key={`${column.heading ?? "footer"}-${index}`} className="min-w-[150px]">
                    {column.heading ? (
                      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-rr-muted">
                        {column.heading}
                      </h2>
                    ) : null}

                    <ul className="space-y-3">
                      {(column.links ?? []).map((link) => (
                        <li key={`${link.label}-${link.href}`}>
                          {isExternalHref(link.href) ? (
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-rr-secondary no-underline transition-colors hover:text-rr-primary"
                            >
                              {link.label}
                            </a>
                          ) : (
                            <Link
                              href={link.href}
                              className="text-sm text-rr-secondary no-underline transition-colors hover:text-rr-primary"
                            >
                              {link.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Mobile: collapsible accordion via native <details>, no JS */}
              <div className="w-full sm:hidden">
                {columns.map((column, index) => (
                  <details
                    key={`m-${column.heading ?? "footer"}-${index}`}
                    className="group border-b border-rr-border"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-xs font-semibold uppercase tracking-[0.14em] text-rr-primary [&::-webkit-details-marker]:hidden">
                      {column.heading ?? "Links"}
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-rr-muted transition-transform duration-300 group-open:rotate-180"
                        aria-hidden
                      >
                        <path
                          d="M6 9l6 6 6-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </summary>
                    <ul className="space-y-3 pb-5 pt-1">
                      {(column.links ?? []).map((link) => (
                        <li key={`m-${link.label}-${link.href}`}>
                          {isExternalHref(link.href) ? (
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-rr-secondary no-underline transition-colors hover:text-rr-green"
                            >
                              {link.label}
                            </a>
                          ) : (
                            <Link
                              href={link.href}
                              className="text-sm text-rr-secondary no-underline transition-colors hover:text-rr-green"
                            >
                              {link.label}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-rr-border pt-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-rr-muted">{footerCopyright}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link
                href="/contact"
                className="text-sm text-rr-secondary underline underline-offset-4 transition-colors hover:text-rr-primary"
              >
                Contact
              </Link>
            </div>
          </div>
          {footerDisclaimer ? (
            <p className="max-w-[560px] text-xs leading-6 text-rr-muted">{footerDisclaimer}</p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import type { PortableTextComponents } from "@portabletext/react";
import { SanityImage } from "@/components/ui/SanityImage";
import { urlFor } from "@/sanity/client";
import { CANONICAL_ORIGIN } from "@/lib/site";

export const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-4 text-[15.5px] leading-7 text-rr-secondary">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mb-4 mt-10 text-3xl font-medium tracking-[-0.02em] text-rr-primary">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-8 text-2xl font-medium tracking-[-0.02em] text-rr-primary">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mb-3 mt-6 text-xl font-medium tracking-[-0.02em] text-rr-primary">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-8 rounded-xl border-l-[3px] border-rr-green bg-rr-surface px-6 py-5 text-lg leading-8 text-rr-primary">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-5 ml-5 list-disc space-y-2 text-[15.5px] leading-7 text-rr-secondary">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mb-5 ml-5 list-decimal space-y-2 text-[15.5px] leading-7 text-rr-secondary">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    underline: ({ children }) => <span className="underline underline-offset-4">{children}</span>,
    "strike-through": ({ children }) => <span className="line-through">{children}</span>,
    colorAccent: ({ children }) => <span style={{ color: "var(--accent)" }}>{children}</span>,
    colorGood: ({ children }) => <span style={{ color: "var(--vr-good-text)" }}>{children}</span>,
    accent: ({ children }) => <span style={{ color: "var(--accent)" }}>{children}</span>,
    good: ({ children }) => <span style={{ color: "var(--vr-good-text)" }}>{children}</span>,
    colorWarn: ({ children }) => <span style={{ color: "var(--vr-warn-text)" }}>{children}</span>,
    colorDanger: ({ children }) => <span style={{ color: "var(--vr-danger-text)" }}>{children}</span>,
    colorMuted: ({ children }) => <span style={{ color: "var(--text-muted)" }}>{children}</span>,
    link: ({ children, value }) => {
      const href =
        value && typeof value === "object" && "href" in value
          ? String(value.href)
          : "#";

      let isInternal = false;
      let internalHref = href;

      if (href.startsWith("/")) {
        isInternal = true;
      } else {
        try {
          const parsed = new URL(href);
          if (parsed.origin === CANONICAL_ORIGIN) {
            isInternal = true;
            internalHref = `${parsed.pathname}${parsed.search}${parsed.hash}`;
          }
        } catch {
          isInternal = false;
        }
      }

      if (!isInternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-rr-green underline decoration-rr-green/40 underline-offset-4 transition hover:opacity-80"
          >
            {children}
          </a>
        );
      }

      return (
        <Link
          href={internalHref}
          className="text-rr-green underline decoration-rr-green/40 underline-offset-4 transition hover:opacity-80"
        >
          {children}
        </Link>
      );
    },
  },
  types: {
    image: ({ value }) => {
      const src = urlFor(value).width(1200).fit("max").auto("format").quality(75).url();
      const alt =
        value && typeof value === "object" && "alt" in value
          ? String(value.alt ?? "")
          : "";

      return (
        <figure className="my-8 overflow-hidden rounded-xl border border-rr-border bg-rr-surface">
          <SanityImage
            src={src}
            alt={alt}
            width={1200}
            height={800}
            sizes="(max-width: 1024px) 100vw, 860px"
            className="h-auto w-full object-cover"
            unoptimized
          />
          {alt ? <figcaption className="px-4 py-3 text-sm text-rr-muted">{alt}</figcaption> : null}
        </figure>
      );
    },
  },
};

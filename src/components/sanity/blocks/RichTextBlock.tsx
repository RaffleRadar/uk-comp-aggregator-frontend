import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { portableTextComponents } from "../portableTextComponents";

type RichTextBlockData = {
  _key?: string;
  _type?: string;
  content?: unknown[];
};

const compactTextComponents: PortableTextComponents = {
  ...portableTextComponents,
  block: {
    normal: ({ children }) => (
      <p className="mb-3 text-sm leading-6 text-rr-secondary">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mb-5 mt-12 text-2xl font-medium tracking-[-0.02em] text-rr-primary first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-1 mt-5 text-base font-medium text-rr-primary first:mt-0">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="mb-1 mt-5 text-base font-medium text-rr-primary first:mt-0">
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
      <ul className="mb-4 ml-5 list-disc space-y-1 text-sm leading-6 text-rr-secondary">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mb-4 ml-5 list-decimal space-y-1 text-sm leading-6 text-rr-secondary">
        {children}
      </ol>
    ),
  },
};

export function RichTextBlock({
  block,
  variant = "default",
}: {
  block: RichTextBlockData;
  variant?: "default" | "compact";
}) {
  return (
    <section className="py-5 md:py-6">
      <div className="container">
        <PortableText
          value={block.content ?? []}
          components={
            variant === "compact" ? compactTextComponents : portableTextComponents
          }
        />
      </div>
    </section>
  );
}

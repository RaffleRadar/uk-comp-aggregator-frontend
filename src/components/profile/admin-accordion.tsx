import type { ReactNode } from "react";

type AdminAccordionProps = {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function AdminAccordion({
  title,
  description,
  defaultOpen,
  children,
}: AdminAccordionProps) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-2xl border border-rr-border bg-rr-surface"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-6 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <div className="text-base font-medium text-rr-primary">{title}</div>
          {description ? (
            <div className="mt-1 text-sm text-rr-secondary">{description}</div>
          ) : null}
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className="shrink-0 text-rr-muted transition-transform duration-300 group-open:rotate-180"
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
      <div className="px-6 pb-6">{children}</div>
    </details>
  );
}

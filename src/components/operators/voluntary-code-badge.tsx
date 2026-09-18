import Link from "next/link";
import { cn } from "@/lib/cn";

const VOLUNTARY_CODE_HREF = "/voluntary-code-prize-draw-operators";

export function VoluntaryCodeBadge({
  scheme,
  size = "default",
  linked = true,
  className,
}: {
  scheme?: string | null;
  size?: "default" | "compact";
  linked?: boolean;
  className?: string;
}) {
  const label = scheme?.trim();

  if (!label) {
    return null;
  }

  const classes = cn(
    "inline-flex items-center gap-1 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium",
    "border border-[#86efac] bg-[#f0fdf4] text-[#15803d]",
    "dark:border-rr-green-border dark:bg-rr-green-bg dark:text-rr-green",
    linked ? "transition-colors hover:brightness-95" : "",
    className,
  );

  const icon = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3 w-3"
    >
      <path d="M12 3 4.5 6v6c0 4.2 3.1 7.6 7.5 9 4.4-1.4 7.5-4.8 7.5-9V6Z" />
      <path d="m9.2 12.2 1.9 1.9 3.7-3.8" />
    </svg>
  );

  if (!linked) {
    return (
      <span className={classes} title={label}>
        {icon}
        VC
      </span>
    );
  }

  return (
    <Link
      href={VOLUNTARY_CODE_HREF}
      title={label}
      aria-label={`${label}. Read what the voluntary code means`}
      className={classes}
    >
      {icon}
      VC
    </Link>
  );
}

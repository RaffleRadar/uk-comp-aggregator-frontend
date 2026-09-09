"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ComponentProps, MouseEvent } from "react";
import {
  parseSpend,
  readSpendCookie,
  withSpend,
} from "@/lib/spend-mode";

const SCROLL_FLAG = "rr-scroll-top-on-nav";

type ViewAllLinkProps = ComponentProps<typeof Link> & {
  ignoreSpend?: boolean;
};

export function ViewAllLink({
  onClick,
  ignoreSpend = false,
  href,
  ...props
}: ViewAllLinkProps) {
  const searchParams = useSearchParams();
  const [cookieSpend, setCookieSpend] = useState<number | null>(null);

  useEffect(() => {
    if (ignoreSpend) return;
    setCookieSpend(readSpendCookie());
  }, [ignoreSpend]);

  const finalHref = useMemo(() => {
    const hrefAsString = typeof href === "string" ? href : href?.toString() ?? "";
    if (ignoreSpend) return hrefAsString;

    const urlSpend = parseSpend(searchParams.get("spend"));
    const spendAmount = urlSpend ?? cookieSpend;
    return withSpend(hrefAsString, spendAmount);
  }, [cookieSpend, href, ignoreSpend, searchParams]);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    try {
      window.sessionStorage.setItem(SCROLL_FLAG, "1");
    } catch {}
  };

  return <Link {...props} href={finalHref} onClick={handleClick} />;
}

"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IconChartBar } from "@tabler/icons-react";
import { formatSpendAmount } from "@/lib/competition-sort";
import { parseSpend, writeSpendCookie } from "@/lib/spend-mode";

export function SpendModeBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const spendParam = searchParams.get("spend");
  const spend = parseSpend(spendParam);

  const sortBy = searchParams.get("sortBy") ?? undefined;

  const handleChangeSpend = useCallback(() => {
    window.dispatchEvent(new CustomEvent("rr:open-spend-menu"));
  }, []);

  const handleClear = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    const isSpendSort =
      sortBy === "spendOdds" ||
      sortBy === "spendEntries" ||
      sortBy === "spendPrize";
    writeSpendCookie(null);
    params.delete("spend");
    if (isSpendSort) {
      params.set("sortBy", "valueRatio");
      params.set("sortOrder", "desc");
    }
    params.delete("page");
    params.delete("search");
    const qs = params.toString();
    const nextHref = qs ? `${pathname}?${qs}` : pathname;
    router.push(nextHref);
  }, [pathname, router, searchParams, sortBy]);

  if (spend == null) {
    return null;
  }

  const amountLabel = formatSpendAmount(spend);

  return (
    <div className="pt-4">
      <div className="container">
        <div className="rounded-2xl border border-rr-border bg-rr-surface p-2.5 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rr-green/10 text-rr-green">
                <IconChartBar size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-rr-primary">
                  {amountLabel} Spend Mode active
                </p>
                <p className="mt-1 text-sm text-rr-secondary">
                  Cards show odds, entries and prize value for a {amountLabel}{" "}
                  spend.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={handleChangeSpend}
                className="inline-flex h-9 items-center justify-center rounded-full border border-rr-border bg-rr-surface px-3 text-sm font-medium text-rr-secondary transition-colors hover:bg-rr-elevated hover:text-rr-primary cursor-pointer"
              >
                Change spend
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex h-9 items-center justify-center rounded-full border border-rr-green-border bg-rr-green-bg px-3 text-sm font-medium text-rr-green transition-colors hover:bg-rr-green/20 cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  IconChartPie,
  IconClock,
  IconLayoutDashboard,
  IconTrophy,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { ScrollTopLink } from "@/components/ui/scroll-top-link";

export type DashboardScreen = "overview" | "market" | "prizes" | "timing";

export const DASHBOARD_SCREENS: {
  key: DashboardScreen;
  label: string;
  icon: typeof IconClock;
}[] = [
  { key: "overview", label: "Overview", icon: IconLayoutDashboard },
  { key: "market", label: "Market", icon: IconChartPie },
  { key: "prizes", label: "Prizes", icon: IconTrophy },
  { key: "timing", label: "Timing", icon: IconClock },
];

export function parseDashboardScreen(value: string | null): DashboardScreen {
  const key = (value ?? "").trim().toLowerCase();
  return (
    DASHBOARD_SCREENS.find((screen) => screen.key === key)?.key ?? "overview"
  );
}

export function DashboardMenu({ screen }: { screen: DashboardScreen }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function screenHref(key: DashboardScreen) {
    const params = new URLSearchParams(searchParams.toString());
    if (key === "overview") params.delete("view");
    else params.set("view", key);
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <nav
      aria-label="Dashboard sections"
      className="overflow-hidden rounded-2xl border border-rr-border bg-rr-surface lg:sticky lg:top-4"
    >
      <div className="grid grid-cols-4 gap-1.5 p-1.5 sm:gap-2 sm:p-2 lg:flex lg:flex-col lg:gap-0 lg:p-0">
        {DASHBOARD_SCREENS.map((item) => {
          const Icon = item.icon;
          const active = item.key === screen;

          return (
            <ScrollTopLink
              key={item.key}
              href={screenHref(item.key)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-xs no-underline transition sm:flex-row sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm lg:w-full lg:justify-start lg:rounded-none lg:border-x-0 lg:border-y-0 lg:border-l-2 lg:py-3",
                active
                  ? "border-rr-green bg-rr-elevated font-medium text-rr-primary lg:border-l-rr-green"
                  : "border-rr-border text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary lg:border-l-transparent",
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span className="max-w-full truncate">{item.label}</span>
            </ScrollTopLink>
          );
        })}
      </div>
    </nav>
  );
}

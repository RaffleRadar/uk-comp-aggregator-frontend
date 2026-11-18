"use client";

import { useEffect, useRef } from "react";
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
  const barRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    const active = activeRef.current;
    if (!bar || !active || bar.scrollWidth <= bar.clientWidth) return;
    const left = active.offsetLeft - (bar.clientWidth - active.offsetWidth) / 2;
    bar.scrollTo({ left: Math.max(0, left), behavior: "auto" });
  }, [screen]);

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
      <div
        ref={barRef}
        className="flex gap-2 overflow-x-auto p-2 [scrollbar-width:none] lg:flex-col lg:gap-0 lg:overflow-visible lg:p-0 [&::-webkit-scrollbar]:hidden"
      >
        {DASHBOARD_SCREENS.map((item) => {
          const Icon = item.icon;
          const active = item.key === screen;

          return (
            <ScrollTopLink
              key={item.key}
              ref={
                active
                  ? (el: HTMLAnchorElement | null) => {
                      activeRef.current = el;
                    }
                  : undefined
              }
              href={screenHref(item.key)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm no-underline transition lg:w-full lg:shrink lg:rounded-none lg:border-x-0 lg:border-y-0 lg:border-l-2 lg:px-3 lg:py-3",
                active
                  ? "border-rr-green bg-rr-elevated font-medium text-rr-primary lg:border-l-rr-green"
                  : "border-rr-border text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary lg:border-l-transparent",
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span>{item.label}</span>
            </ScrollTopLink>
          );
        })}
      </div>
    </nav>
  );
}

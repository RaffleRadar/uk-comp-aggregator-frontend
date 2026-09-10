import Link from "next/link";
import {
  IconTrophy,
  IconCoins,
  IconGift,
  IconSearch,
  IconChevronRight,
} from "@tabler/icons-react";

type QuickAction = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const ACTIONS: QuickAction[] = [
  {
    title: "Best chance of winning",
    description: "Find draws with the strongest odds.",
    href: "/competitions?sortBy=ticketsTotal&sortOrder=asc",
    icon: IconTrophy,
  },
  {
    title: "I have a budget to spend",
    description: "See what your budget gets you.",
    href: "/competitions?spend=5&sortBy=spendOdds&sortOrder=asc",
    icon: IconCoins,
  },
  {
    title: "Biggest prize",
    description: "Find the highest value prizes.",
    href: "/competitions?sortBy=prizeValue&sortOrder=desc",
    icon: IconGift,
  },
  {
    title: "I know what I want",
    description: "Search cars, watches, cash and more.",
    href: "/search",
    icon: IconSearch,
  },
];

export function QuickActions({ title }: { title: string }) {
  return (
    <section className="container pt-2 pb-2 lg:pt-0 lg:pb-4">
      <h2 className="mb-3 text-base font-semibold text-rr-primary lg:text-lg">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 rounded-xl border border-rr-border bg-rr-surface px-3 py-3 no-underline transition hover:border-rr-green/50 hover:bg-rr-elevated"
            >
              <Icon className="h-7 w-7 shrink-0 text-rr-green" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight text-rr-primary">
                  {action.title}
                </p>
                <p className="mt-0.5 text-[12px] leading-4 text-rr-muted">
                  {action.description}
                </p>
              </div>
              <IconChevronRight className="h-4 w-4 shrink-0 text-rr-muted" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}

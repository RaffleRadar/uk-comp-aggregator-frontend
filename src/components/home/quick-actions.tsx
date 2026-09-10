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
  shortTitle: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const ACTIONS: QuickAction[] = [
  {
    title: "Best chance of winning",
    shortTitle: "Best chance",
    description: "Draws with the strongest odds.",
    href: "/competitions?sortBy=ticketsTotal&sortOrder=asc",
    icon: IconTrophy,
  },
  {
    title: "I have a budget to spend",
    shortTitle: "Set a budget",
    description: "See what your budget gets you.",
    href: "/competitions?spend=5&sortBy=spendOdds&sortOrder=asc",
    icon: IconCoins,
  },
  {
    title: "Biggest prize",
    shortTitle: "Biggest prize",
    description: "Find the highest value prizes.",
    href: "/competitions?sortBy=prizeValue&sortOrder=desc",
    icon: IconGift,
  },
  {
    title: "I know what I want",
    shortTitle: "Find a prize",
    description: "Cars, watches, cash and more.",
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
              className="flex items-center gap-3 rounded-xl border border-rr-border bg-rr-surface px-3 py-2.5 no-underline transition hover:border-rr-green/50 hover:bg-rr-elevated sm:py-3"
            >
              <Icon className="h-6 w-6 shrink-0 text-rr-green sm:h-7 sm:w-7" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight text-rr-primary">
                  <span className="sm:hidden">{action.shortTitle}</span>
                  <span className="hidden sm:inline">{action.title}</span>
                </p>
                <p className="mt-0.5 hidden text-[12px] leading-4 text-rr-muted sm:block">
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

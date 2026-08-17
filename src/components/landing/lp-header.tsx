"use client";

import Image from "next/image";
import Link from "next/link";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";

export function LpHeader({ campaign }: { campaign: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="border-b border-rr-border bg-rr-surface">
      <div className="container flex h-[68px] items-center gap-3">
        <Link
          href="/"
          aria-label="RaffleRadar home"
          className="flex shrink-0 items-center gap-2.5 text-rr-primary no-underline hover:text-rr-primary"
        >
          <Image
            src="/favnew.svg"
            alt="RaffleRadar"
            width={40}
            height={40}
            className="h-10 w-10 shrink-0"
            priority
          />
          <span className="text-sm font-semibold tracking-[-0.3px] sm:text-base">
            RAFFLE<span className="text-rr-green">RADAR</span>
          </span>
        </Link>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button
            variant="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            <IconSun size={18} className="hidden dark:block" />
            <IconMoon size={18} className="block dark:hidden" />
          </Button>
          <Link
            href={`/register?next=%2F&lp=${campaign}`}
            className="hidden rounded-md bg-rr-green px-4 py-2 text-sm font-medium text-rr-on-accent no-underline transition hover:opacity-90 sm:inline-flex"
          >
            Create free account
          </Link>
        </div>
      </div>
    </header>
  );
}

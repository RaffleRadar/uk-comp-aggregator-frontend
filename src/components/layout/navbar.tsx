"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  IconChevronDown,
  IconFileText,
  IconLogin,
  IconLogout,
  IconMail,
  IconMenu2,
  IconMoon,
  IconSettings,
  IconStar,
  IconSun,
  IconTag,
  IconTrophy,
  IconUser,
  IconUserPlus,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/contexts/auth-context";
import { CompetitionSearch } from "@/components/layout/competition-search";
import { useTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";

function getInitials(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const second = (parts.length > 1 ? parts[1]?.[0] : parts[0]?.[1]) ?? "";
  return (first + second).toUpperCase() || "?";
}

const mobileItemBase =
  "flex items-center gap-3 rounded-xl border px-4 py-3 text-[15px] font-medium no-underline transition";
const mobileItemIdle =
  "border-rr-border bg-rr-elevated text-rr-primary [@media(hover:hover)]:hover:border-rr-green/40 [@media(hover:hover)]:hover:bg-rr-green-bg";
const mobileItemActive = "border-rr-green bg-rr-green text-rr-on-accent";
const mobileItemCta =
  "border-rr-green bg-transparent text-rr-green [@media(hover:hover)]:hover:bg-rr-green-bg";

export function Navbar() {
  const { user, status, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuButtonRef = useRef<HTMLButtonElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const accountLinkRef = useRef<HTMLAnchorElement | null>(null);
  const signOutButtonRef = useRef<HTMLButtonElement | null>(null);

  const isCompetitionsActive = pathname === "/competitions" || pathname.startsWith("/competitions/");
  const isOperatorsActive = pathname === "/operators" || pathname.startsWith("/operators/");
  const isReviewsActive = pathname === "/reviews" || pathname.startsWith("/reviews/");
  const isBlogActive = pathname === "/blog" || pathname.startsWith("/blog/");
  const isContactActive = pathname === "/contact";

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (media.matches) setMenuOpen(false);
    };
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (userMenuButtonRef.current?.contains(target)) return;
      if (userMenuRef.current?.contains(target)) return;
      setUserMenuOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setUserMenuOpen(false);
      userMenuButtonRef.current?.focus();
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [userMenuOpen]);

  const label = user?.displayName?.trim() || user?.email || "";
  const initials = label ? getInitials(label.includes("@") ? label.split("@")[0] : label) : "";

  async function handleSignOut(closeMobileMenu: boolean) {
    setUserMenuOpen(false);
    if (closeMobileMenu) setMenuOpen(false);
    await logout();
    router.replace("/");
  }

  function focusUserMenuItem(index: number) {
    const items = [accountLinkRef.current, signOutButtonRef.current].filter(
      (item): item is HTMLAnchorElement | HTMLButtonElement => item !== null,
    );
    items[index]?.focus();
  }

  function handleUserMenuTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    setUserMenuOpen(true);
    const items = [accountLinkRef.current, signOutButtonRef.current].filter(Boolean);
    if (!items.length) return;
    focusUserMenuItem(event.key === "ArrowDown" ? 0 : items.length - 1);
  }

  function handleUserMenuPanelKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const items = [accountLinkRef.current, signOutButtonRef.current].filter(
      (item): item is HTMLAnchorElement | HTMLButtonElement => item !== null,
    );
    if (event.key === "Escape") {
      event.preventDefault();
      setUserMenuOpen(false);
      userMenuButtonRef.current?.focus();
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const currentIndex = items.findIndex((item) => item === document.activeElement);
    if (currentIndex === -1) {
      items[event.key === "ArrowDown" ? 0 : items.length - 1]?.focus();
      return;
    }
    const nextIndex =
      event.key === "ArrowDown"
        ? (currentIndex + 1) % items.length
        : (currentIndex - 1 + items.length) % items.length;
    items[nextIndex]?.focus();
  }

  if (status === "loading") {
    return (
      <div className="relative">
        <div className="mt-2 bg-rr-surface">
          <nav className="flex h-[52px] items-center gap-3 px-5">
            <Link href="/" className="shrink-0 flex items-center gap-2.5 text-rr-primary no-underline" aria-label="RaffleRadar home">
              <Image src="/favnew.svg" alt="RaffleRadar" width={40} height={40} className="h-10 w-10 shrink-0" priority />
              <span className="text-sm font-semibold tracking-[-0.3px] sm:text-base">RAFFLE<span className="text-rr-green">RADAR</span></span>
            </Link>
            <div className="hidden min-w-0 sm:block sm:flex-1 max-w-[420px] md:max-w-[520px]">
              <Suspense fallback={null}>
                <CompetitionSearch />
              </Suspense>
            </div>
            <div className="ml-auto shrink-0 flex items-center gap-2">
              <Button variant="icon" className="shrink-0 cursor-pointer" aria-label="Toggle theme" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
                <IconSun size={18} className="hidden dark:block" />
                <IconMoon size={18} className="block dark:hidden" />
              </Button>
            </div>
          </nav>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="mt-2 bg-rr-surface">
        <nav className="flex h-[52px] items-center gap-3 px-5">
          <Link href="/" className="shrink-0 flex items-center gap-2.5 text-rr-primary no-underline" aria-label="RaffleRadar home">
            <Image src="/favnew.svg" alt="RaffleRadar" width={40} height={40} className="h-10 w-10 shrink-0" priority />
            <span className="text-sm font-semibold tracking-[-0.3px] sm:text-base">RAFFLE<span className="text-rr-green">RADAR</span></span>
          </Link>

          <div className="hidden min-w-0 sm:block sm:flex-1 max-w-[420px] md:max-w-[520px]">
            <Suspense fallback={null}>
              <CompetitionSearch />
            </Suspense>
          </div>

          <div className="hidden md:ml-8 md:flex md:gap-1 ml-4">
            <Link href="/competitions" aria-current={isCompetitionsActive ? "page" : undefined} className={cn("text-sm px-3 py-2 rounded-md no-underline whitespace-nowrap", isCompetitionsActive ? "bg-rr-green text-rr-on-accent" : "text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary")}>Competitions</Link>
            <Link href="/operators" aria-current={isOperatorsActive ? "page" : undefined} className={cn("text-sm px-3 py-2 rounded-md no-underline whitespace-nowrap", isOperatorsActive ? "bg-rr-green text-rr-on-accent" : "text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary")}>Operators</Link>
            <Link href="/reviews" aria-current={isReviewsActive ? "page" : undefined} className={cn("text-sm px-3 py-2 rounded-md no-underline whitespace-nowrap", isReviewsActive ? "bg-rr-green text-rr-on-accent" : "text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary")}>Reviews</Link>
            <Link href="/blog" aria-current={isBlogActive ? "page" : undefined} className={cn("text-sm px-3 py-2 rounded-md no-underline whitespace-nowrap", isBlogActive ? "bg-rr-green text-rr-on-accent" : "text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary")}>Blog</Link>
            <Link href="/how-it-works" className="text-sm px-3 py-2 rounded-md text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary no-underline whitespace-nowrap">How it works</Link>
            <Link href="/get-listed" className="text-sm px-3 py-2 rounded-md text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary no-underline whitespace-nowrap">Get Listed</Link>
            <Link href="/contact" aria-current={isContactActive ? "page" : undefined} className={cn("text-sm px-3 py-2 rounded-md no-underline whitespace-nowrap", isContactActive ? "bg-rr-green text-rr-on-accent" : "text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary")}>Contact</Link>
          </div>

          <div className="ml-auto shrink-0 flex items-center gap-2">
            <Button variant="icon" className="shrink-0 cursor-pointer" aria-label="Toggle theme" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
              <IconSun size={18} className="hidden dark:block" />
              <IconMoon size={18} className="block dark:hidden" />
            </Button>

            {status === "authenticated" && user ? (
              <div className="relative">
                <button
                  ref={userMenuButtonRef}
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  onClick={() => setUserMenuOpen((v) => !v)}
                  onKeyDown={handleUserMenuTriggerKeyDown}
                  className="flex items-center gap-2 rounded-md px-1 py-1 text-rr-secondary transition hover:bg-rr-elevated hover:text-rr-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rr-green/20"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-rr-green bg-rr-green-bg text-xs font-medium text-rr-green">
                    {initials}
                  </div>
                  <span className="hidden whitespace-nowrap text-sm text-rr-secondary md:inline">
                    {user.displayName || user.email}
                  </span>
                  <IconChevronDown
                    size={16}
                    className={cn("hidden transition md:block", userMenuOpen && "rotate-180")}
                  />
                </button>
                {userMenuOpen ? (
                  <div
                    ref={userMenuRef}
                    role="menu"
                    onKeyDown={handleUserMenuPanelKeyDown}
                    className="absolute right-0 top-full z-50 mt-2 w-40 max-w-[calc(100vw-1.5rem)] rounded-xl border border-rr-border bg-rr-surface p-1.5 shadow-lg md:w-52"
                  >
                    <Link
                      href="/profile"
                      role="menuitem"
                      ref={(el) => { accountLinkRef.current = el; }}
                      onClick={() => setUserMenuOpen(false)}
                      className="flex w-full min-w-0 items-center rounded-lg px-3 py-2 text-sm text-rr-secondary no-underline transition hover:bg-rr-elevated hover:text-rr-primary"
                    >
                      Account
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      ref={(el) => { signOutButtonRef.current = el; }}
                      onClick={() => { void handleSignOut(false); }}
                      className="flex w-full min-w-0 items-center rounded-lg px-3 py-2 text-left text-sm text-rr-secondary transition hover:bg-rr-elevated hover:text-rr-primary"
                    >
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : status === "unauthenticated" ? (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="secondary" className="text-sm" onClick={() => router.push("/login")}>Log in</Button>
                <Button variant="primary" className="text-sm" onClick={() => router.push("/register")}>Sign up</Button>
              </div>
            ) : null}

            <Button variant="icon" className="shrink-0 md:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
              {menuOpen ? <IconX size={18} /> : <IconMenu2 size={18} />}
            </Button>
          </div>
        </nav>

        <div className="w-full min-w-0 max-w-full px-4 pb-3 sm:hidden">
          <Suspense fallback={null}>
            <CompetitionSearch />
          </Suspense>
        </div>
      </div>

      {menuOpen ? (
        <div className="absolute left-0 right-0 top-full z-50 border-t border-rr-border bg-rr-surface shadow-lg md:hidden">
          <div className="flex flex-col gap-2 px-4 py-4">
            <Link
              href="/competitions"
              aria-current={isCompetitionsActive ? "page" : undefined}
              className={cn(mobileItemBase, isCompetitionsActive ? mobileItemActive : mobileItemIdle)}
              onClick={() => setMenuOpen(false)}
            >
              <IconTrophy size={20} className={cn("shrink-0", isCompetitionsActive ? "text-rr-on-accent" : "text-rr-green")} />
              Competitions
            </Link>
            <Link
              href="/operators"
              aria-current={isOperatorsActive ? "page" : undefined}
              className={cn(mobileItemBase, isOperatorsActive ? mobileItemActive : mobileItemIdle)}
              onClick={() => setMenuOpen(false)}
            >
              <IconUsers size={20} className={cn("shrink-0", isOperatorsActive ? "text-rr-on-accent" : "text-rr-green")} />
              Operators
            </Link>
            <Link
              href="/reviews"
              aria-current={isReviewsActive ? "page" : undefined}
              className={cn(mobileItemBase, isReviewsActive ? mobileItemActive : mobileItemIdle)}
              onClick={() => setMenuOpen(false)}
            >
              <IconStar size={20} className={cn("shrink-0", isReviewsActive ? "text-rr-on-accent" : "text-rr-green")} />
              Reviews
            </Link>
            <Link
              href="/blog"
              aria-current={isBlogActive ? "page" : undefined}
              className={cn(mobileItemBase, isBlogActive ? mobileItemActive : mobileItemIdle)}
              onClick={() => setMenuOpen(false)}
            >
              <IconFileText size={20} className={cn("shrink-0", isBlogActive ? "text-rr-on-accent" : "text-rr-green")} />
              Blog
            </Link>
            <Link
              href="/how-it-works"
              className={cn(mobileItemBase, mobileItemIdle)}
              onClick={() => setMenuOpen(false)}
            >
              <IconSettings size={20} className="shrink-0 text-rr-green" />
              How it works
            </Link>
            <Link
              href="/get-listed"
              className={cn(mobileItemBase, mobileItemIdle)}
              onClick={() => setMenuOpen(false)}
            >
              <IconTag size={20} className="shrink-0 text-rr-green" />
              Get Listed
            </Link>
            <Link
              href="/contact"
              aria-current={isContactActive ? "page" : undefined}
              className={cn(mobileItemBase, isContactActive ? mobileItemActive : mobileItemIdle)}
              onClick={() => setMenuOpen(false)}
            >
              <IconMail size={20} className={cn("shrink-0", isContactActive ? "text-rr-on-accent" : "text-rr-green")} />
              Contact
            </Link>

            {status === "authenticated" && user ? (
              <>
                <Link
                  href="/profile"
                  className={cn(mobileItemBase, mobileItemIdle)}
                  onClick={() => setMenuOpen(false)}
                >
                  <IconUser size={20} className="shrink-0 text-rr-green" />
                  Account
                </Link>
                <button
                  type="button"
                  className={cn(mobileItemBase, mobileItemIdle, "w-full cursor-pointer text-left")}
                  onClick={() => { void handleSignOut(true); }}
                >
                  <IconLogout size={20} className="shrink-0 text-rr-green" />
                  Sign out
                </button>
              </>
            ) : status === "unauthenticated" ? (
              <>
                <button
                  type="button"
                  className={cn(mobileItemBase, mobileItemIdle, "w-full cursor-pointer text-left")}
                  onClick={() => { setMenuOpen(false); router.push("/login"); }}
                >
                  <IconLogin size={20} className="shrink-0 text-rr-green" />
                  Log in
                </button>
                <button
                  type="button"
                  className={cn(mobileItemBase, mobileItemCta, "w-full cursor-pointer text-left")}
                  onClick={() => { setMenuOpen(false); router.push("/register"); }}
                >
                  <IconUserPlus size={20} className="shrink-0 text-rr-green" />
                  Sign up
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

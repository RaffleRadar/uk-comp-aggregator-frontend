"use client";

import { useEffect, useMemo, useState } from "react";
import {
  IconHeart,
  IconSearch,
  IconSettings,
  IconShieldLock,
} from "@tabler/icons-react";
import { AccountGreeting } from "@/components/account/account-greeting";
import { NewsletterBanner } from "@/components/account/newsletter-banner";
import { SavedSearchesSection } from "@/components/account/saved-searches-section";
import { SettingsSection } from "@/components/account/settings-section";
import { CompetitionGridClient } from "@/components/competitions/competition-grid-client";
import { AdminAccordion } from "@/components/profile/admin-accordion";
import { CompetitionAdmin } from "@/components/profile/competition-admin";
import { CommentModeration } from "@/components/profile/comment-moderation";
import { ScraperPanel } from "@/components/profile/scraper-panel";
import { RadarLoader } from "@/components/ui/RadarLoader";
import { useAuth } from "@/contexts/auth-context";
import { useWishlist } from "@/contexts/wishlist-context";
import { getCompetition, type CompetitionDetail } from "@/lib/api";
import { cn } from "@/lib/cn";
import type { Competition } from "@/types/competition";

type WishlistItem = {
  id: string;
  addedAt: string;
};

type AccountSection = "wishlist" | "searches" | "scrapers" | "settings";

const sections: {
  id: AccountSection;
  label: string;
  icon: typeof IconHeart;
}[] = [
  { id: "wishlist", label: "Wishlist", icon: IconHeart },
  { id: "searches", label: "Saved searches", icon: IconSearch },
  { id: "scrapers", label: "Admin", icon: IconShieldLock },
  { id: "settings", label: "Settings", icon: IconSettings },
];

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function toCompetition(item: CompetitionDetail): Competition {
  return {
    id: item.id,
    prize: item.prize,
    imageUrl: item.imageUrl,
    ticketPrice: item.ticketPrice,
    ticketsTotal: item.ticketsTotal,
    ticketsLeft: item.ticketsLeft,
    percentSold: item.percentSold,
    finalPercentSold: item.finalPercentSold,
    endsAt: item.endsAt,
    createdAt: item.createdAt,
    isActive: item.isActive,
    closedAt: item.closedAt,
    category: item.category,
    instantPrizes: item.instantPrizes,
    availableToBuy: item.availableToBuy,
    valueRatio: item.valueRatio,
    operator: item.operator,
    prizeValue: item.prizeValue,
    cashAlternative: item.cashAlternative,
    maxPerPerson: item.maxPerPerson,
    numWinners: item.numWinners,
    prizeMake: item.prizeMake,
    prizeModel: item.prizeModel,
    description: item.description,
    sourceUrl: item.sourceUrl,
  };
}

function WishlistPlaceholder() {
  return (
    <div className="rounded-2xl border border-rr-border bg-rr-surface p-6">
      <h3 className="mb-2 text-base font-medium text-rr-primary">Wishlist</h3>
      <p className="text-sm text-rr-secondary">Saved competitions will appear here.</p>
    </div>
  );
}

function WishlistSection() {
  const { status } = useAuth();
  const { isLoading: isWishlistLoading, isSaved } = useWishlist();
  const [items, setItems] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (status !== "authenticated") {
        setItems([]);
        setLoadError("");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError("");

      try {
        const response = await fetch("/api/wishlists", {
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as WishlistItem[];
        const orderedItems = Array.isArray(data) ? data : [];
        const detailedItems = await Promise.allSettled(
          orderedItems.map(async (item) => toCompetition(await getCompetition(item.id))),
        );
        const nextItems = detailedItems.flatMap((result) =>
          result.status === "fulfilled" ? [result.value] : [],
        );

        if (!cancelled) {
          setItems(nextItems);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(getErrorMessage(error, "Failed to load wishlist."));
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [status]);

  const visibleItems = useMemo(
    () => items.filter((item) => isSaved(item.id)),
    [isSaved, items],
  );
  const isSectionLoading = isLoading || (status === "authenticated" && isWishlistLoading);

  return (
    <section>
      {isSectionLoading ? (
        <div className="flex min-h-[220px] items-center justify-center">
          <RadarLoader size="md" label="Loading wishlist" />
        </div>
      ) : loadError ? (
        <div
          role="alert"
          className="rounded-2xl border border-rr-border bg-rr-surface p-6 text-sm text-rr-primary"
        >
          {loadError}
        </div>
      ) : visibleItems.length > 0 ? (
        <CompetitionGridClient
          competitions={visibleItems}
          featuredIds={[]}
          pageSize={Math.max(visibleItems.length, 1)}
          embedded
          interactiveWhenEnded
        />
      ) : (
        <WishlistPlaceholder />
      )}
    </section>
  );
}

function SectionContent({ section }: { section: AccountSection }) {
  switch (section) {
    case "wishlist":
      return <WishlistSection />;
    case "searches":
      return <SavedSearchesSection />;
    case "scrapers":
      return (
        <div className="space-y-6">
          <AdminAccordion title="Scrapers">
            <ScraperPanel />
          </AdminAccordion>
          <AdminAccordion title="Competitions">
            <CompetitionAdmin />
          </AdminAccordion>
          <AdminAccordion title="Comments">
            <CommentModeration />
          </AdminAccordion>
        </div>
      );
    case "settings":
      return <SettingsSection />;
    default:
      return <WishlistPlaceholder />;
  }
}

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState<AccountSection>("wishlist");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6">
        <AccountGreeting />
      </div>

      <div className="mb-6">
        <NewsletterBanner />
      </div>

      <div className="grid gap-6 md:grid-cols-[14rem_1fr]">
        <nav className="overflow-hidden rounded-2xl border border-rr-border bg-rr-surface md:w-52">
          <div className="flex flex-wrap gap-2 p-2 md:flex-col md:gap-0 md:p-0">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex min-w-0 basis-[calc(50%-0.25rem)] items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm transition md:w-full md:basis-auto md:rounded-none md:border-x-0 md:border-y-0 md:border-l-2 md:px-3",
                    isActive
                      ? "border-rr-green bg-rr-elevated font-medium text-rr-primary md:border-l-rr-green"
                      : "border-rr-border text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary md:border-l-transparent",
                  )}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="min-w-0 break-words md:truncate">{section.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
        <SectionContent section={activeSection} />
      </div>
    </div>
  );
}

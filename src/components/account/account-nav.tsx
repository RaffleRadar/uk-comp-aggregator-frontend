"use client";

import {
  IconHeart,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import { cn } from "@/lib/cn";

export type AccountSection = "wishlist" | "searches" | "settings";

type AccountNavProps = {
  active: AccountSection;
  onChange: (section: AccountSection) => void;
};

const sections: { id: AccountSection; label: string; icon: typeof IconHeart }[] = [
  { id: "wishlist", label: "Wishlist", icon: IconHeart },
  { id: "searches", label: "Saved searches", icon: IconSearch },
  { id: "settings", label: "Settings", icon: IconSettings },
];

export function AccountNav({ active, onChange }: AccountNavProps) {
  return (
    <nav className="overflow-hidden rounded-2xl border border-rr-border bg-rr-surface md:w-52">
      <div className="flex flex-wrap gap-2 p-2 md:flex-col md:gap-0 md:p-0">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = active === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onChange(section.id)}
              className={cn(
                "flex min-w-0 basis-[calc(50%-0.25rem)] items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm transition md:w-full md:basis-auto md:rounded-none md:border-x-0 md:border-y-0 md:border-l-2 md:px-3",
                isActive
                  ? "border-rr-green bg-rr-elevated font-medium text-rr-primary md:border-l-rr-green"
                  : "border-rr-border text-rr-secondary hover:bg-rr-elevated hover:text-rr-primary md:border-l-transparent"
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span className="min-w-0 break-words md:truncate">{section.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

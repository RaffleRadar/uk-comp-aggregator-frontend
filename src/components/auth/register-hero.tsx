import {
  IconBell,
  IconBookmark,
  IconChartLine,
  IconShieldCheck,
} from "@tabler/icons-react";
import { LpPhonePreview } from "@/components/landing/lp-phone-preview";

const featureItems = [
  { icon: IconBell, label: "Alerts for undersold draws" },
  { icon: IconBookmark, label: "Save competitions you like" },
  { icon: IconChartLine, label: "Compare price, sold % and time left" },
  { icon: IconShieldCheck, label: "Trusted, vetted operators only" },
];

export function RegisterHero() {
  return (
    <div className="min-w-0">
      <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-rr-green-border bg-rr-green-bg px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.05em] text-rr-green">
        <span className="h-2 w-2 rounded-full bg-rr-green" />
        Free alerts, no subscription
      </span>

      <h1 className="text-[38px] font-bold leading-[1.05] tracking-[-0.035em] text-rr-primary sm:text-[46px]">
        Find better competitions.
        <span className="block text-rr-green">Get alerts before you miss them.</span>
      </h1>

      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start lg:gap-10 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <p className="text-[17px] leading-8 text-rr-secondary">
            Create a free RaffleRadar account to track UK prize competitions,
            save your favourites and get alerts when better opportunities
            appear.
          </p>

          <ul className="mt-9 grid gap-6">
            {featureItems.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.label}
                  className="flex items-center gap-4 text-[16px] leading-7 text-rr-primary"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rr-green-border bg-rr-green-bg text-rr-green">
                    <Icon size={20} stroke={1.8} />
                  </span>
                  <span className="font-medium">{item.label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="hidden min-w-0 lg:block lg:h-[560px]">
          <div className="w-full origin-top scale-[0.9]">
            <LpPhonePreview />
          </div>
        </div>
      </div>
    </div>
  );
}

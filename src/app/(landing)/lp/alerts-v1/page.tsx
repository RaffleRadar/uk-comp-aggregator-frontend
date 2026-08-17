import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  IconBell,
  IconBookmark,
  IconChartLine,
  IconShieldCheck,
} from "@tabler/icons-react";
import { LpHeader } from "@/components/landing/lp-header";
import { LpPhonePreview } from "@/components/landing/lp-phone-preview";
import { LpSignupForm } from "@/components/landing/lp-signup-form";
import { LpSoldMeters } from "@/components/landing/lp-sold-meters";

const CAMPAIGN = "alerts-v1";

export const metadata: Metadata = {
  title: "RaffleRadar | Get alerts before the best competitions sell out",
  description:
    "Free alerts when great prizes still have low entries. Compare UK prize competitions in one place.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

const PRIVACY_HREF = "/privacy-policy";
const TERMS_HREF = "/terms";

const trustItems = [
  { icon: IconShieldCheck, label: "Trusted operators" },
  { icon: IconBell, label: "Competition alerts" },
  { icon: IconBookmark, label: "Save favourites" },
  { icon: IconChartLine, label: "Compare competitions" },
];

const steps = [
  {
    title: "Create your free account",
    body: "Email and password, nothing else. No card, no subscription.",
  },
  {
    title: "Pick what you want to win",
    body: "Cars, cash, watches, tech, houses. Save the competitions worth watching.",
  },
  {
    title: "Get alerted while odds are good",
    body: "We tell you when a prize you follow is closing soon and still undersold.",
  },
];

const watching = [
  {
    image: "/lp/alerts-v1/watching-1-cars.png",
    alt: "Land Rover Defender prize competition",
    title: "Cars and bikes",
    body: "Performance and everyday, weekly draws",
  },
  {
    image: "/lp/alerts-v1/watching-2-cash.png",
    alt: "£100,000 cash prize competition",
    title: "Cash and instant wins",
    body: "From £500 to six figures",
  },
  {
    image: "/lp/alerts-v1/watching-3-houses.png",
    alt: "House and villa prize competition",
    title: "Houses and holidays",
    body: "The headline draws, tracked from launch",
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-rr-bg">
      <LpHeader campaign={CAMPAIGN} />

      <main>
        <section className="pt-10 pb-14 sm:pt-12 sm:pb-16">
          <div className="container grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-rr-green-border bg-rr-green-bg px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.05em] text-rr-green">
                <span className="h-2 w-2 rounded-full bg-rr-green" />
                Free alerts, no subscription
              </span>

              <h1 className="text-[38px] font-bold leading-[1.05] tracking-[-0.035em] text-rr-primary sm:text-[46px]">
                Find better competitions.
                <span className="block text-rr-green">Get alerts before you miss them.</span>
              </h1>

              <p className="mt-5 max-w-[34rem] text-[18px] leading-8 text-rr-secondary">
                RaffleRadar tracks UK prize competitions in one place, compares them instantly,
                and alerts you when great prizes still have low entries.
              </p>

              <LpSignupForm campaign={CAMPAIGN} placement="hero" className="mt-7" />

              <p className="mt-3.5 text-[14px] text-rr-muted">
                Free to join. No subscription. Unsubscribe in one click.
              </p>
            </div>

            <LpPhonePreview />
          </div>
        </section>

        <section className="pb-14 sm:pb-16">
          <div className="container">
            <div className="grid grid-cols-2 rounded-2xl border border-rr-border bg-rr-elevated md:grid-cols-4">
              {trustItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={[
                      "px-4 py-7 text-center",
                      index % 2 === 1 ? "border-l border-rr-border" : "",
                      index >= 2 ? "border-t border-rr-border md:border-t-0" : "",
                      index === 2 ? "md:border-l md:border-rr-border" : "",
                      index === 3 ? "md:border-l md:border-rr-border" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <Icon size={32} className="mx-auto mb-2.5 text-rr-green" stroke={1.6} />
                    <p className="text-[15px] font-semibold leading-tight text-rr-primary">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-16">
          <div className="bg-rr-surface">
            <div className="container grid items-center gap-12 lg:grid-cols-2 py-14 sm:py-16">
              <div>
                <h2 className="text-[30px] font-bold leading-[1.1] tracking-[-0.03em] text-rr-primary sm:text-[38px]">
                  Odds you can actually see
                </h2>
              <p className="mt-4 text-[17px] leading-8 text-rr-secondary">
                Every competition shows how many tickets are gone. The fewer sold, the better your
                odds for the same money. RaffleRadar surfaces the ones still sitting low.
              </p>
              <ul className="mt-6 grid gap-3">
                {[
                  "Live ticket counts pulled from operator sites, updated through the day.",
                  "Sort by percentage sold, ticket price, or time remaining.",
                  "Alerts when a prize you care about is still undersold near the close.",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-[16px] leading-7 text-rr-secondary">
                    <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rr-green-bg text-rr-green">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3 w-3"
                        aria-hidden="true"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

              <LpSoldMeters />
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-16">
          <div className="container">
            <h2 className="text-center text-[30px] font-bold leading-[1.1] tracking-[-0.03em] text-rr-primary sm:text-[38px]">
              Three steps to better odds
            </h2>
            <p className="mx-auto mt-3 max-w-[34rem] text-center text-[17px] leading-8 text-rr-secondary">
              Set up once, then let the alerts do the watching.
            </p>

            <ol className="mt-8 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-2xl border border-rr-border bg-rr-elevated p-7"
                >
                  <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-rr-green">
                    Step 0{index + 1}
                  </span>
                  <h3 className="mt-3 text-[20px] font-semibold tracking-[-0.02em] text-rr-primary">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-7 text-rr-secondary">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="py-14 sm:py-16">
          <div className="bg-rr-surface">
            <div className="container py-14 sm:py-16">
              <h2 className="text-center text-[30px] font-bold leading-[1.1] tracking-[-0.03em] text-rr-primary sm:text-[38px]">
                Prizes people are watching now
              </h2>
            <p className="mx-auto mt-3 max-w-[34rem] text-center text-[17px] leading-8 text-rr-secondary">
              A sample of what runs on the platform week to week.
            </p>

            <div className="mt-8 grid items-start gap-6 md:grid-cols-3">
              {watching.map((item) => (
                <article
                  key={item.title}
                  className="overflow-hidden rounded-2xl border border-rr-border bg-rr-elevated"
                >
                  <div className="relative aspect-[4/3] bg-rr-elevated">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-h-[88px] px-5 py-4">
                    <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-rr-primary">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[14px] text-rr-muted">{item.body}</p>
                  </div>
                </article>
              ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 sm:py-16">
          <div className="container">
            <div className="rounded-3xl border border-rr-border bg-rr-elevated px-6 py-14 text-center sm:px-12">
              <h2 className="text-[30px] font-bold leading-[1.1] tracking-[-0.03em] text-rr-primary sm:text-[38px]">
                Stop scrolling ten operator sites
              </h2>
              <p className="mx-auto mt-3 whitespace-nowrap text-center text-[17px] leading-8 text-rr-secondary">
                One account, every competition worth entering, alerts before they close.
              </p>

              <div className="mt-8 flex justify-center">
                <LpSignupForm campaign={CAMPAIGN} placement="footer" />
              </div>

              <p className="mt-3.5 text-[14px] text-rr-muted">
                Free to join. No subscription. Unsubscribe in one click.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-rr-border py-8">
        <div className="container flex flex-wrap items-center justify-between gap-4 text-[14px] text-rr-muted">
          <span>&copy; {new Date().getFullYear()} RaffleRadar</span>
          <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href={PRIVACY_HREF} className="no-underline hover:text-rr-primary">
              Privacy
            </Link>
            <Link href={TERMS_HREF} className="no-underline hover:text-rr-primary">
              Terms
            </Link>
            <span>18+ only. Please play responsibly.</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

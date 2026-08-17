import Image from "next/image";
import { IconBookmark, IconMenu2 } from "@tabler/icons-react";

type PreviewCard = {
  image: string;
  alt: string;
  title: string;
  cashAlternative: string;
  ticketPrice: string;
  soldLabel: string;
  daysLeft: string;
  daysLabel: string;
};

const cards: PreviewCard[] = [
  {
    image: "/lp/alerts-v1/phone-1-mustang.png",
    alt: "Ford Mustang GT Fastback",
    title: "Ford Mustang GT Fastback",
    cashAlternative: "Cash alternative: £80,000",
    ticketPrice: "£2.99",
    soldLabel: "16%",
    daysLeft: "2",
    daysLabel: "Days left",
  },
  {
    image: "/lp/alerts-v1/phone-2-rolex.png",
    alt: "2026 Rolex Submariner Starbucks",
    title: "2026 Rolex Submariner Starbucks",
    cashAlternative: "Cash alternative: £8,000",
    ticketPrice: "£2.27",
    soldLabel: "25%",
    daysLeft: "1",
    daysLabel: "Day left",
  },
  {
    image: "/lp/alerts-v1/phone-3-suzuki.png",
    alt: "2005 Suzuki GSXR1000 K5",
    title: "2005 Suzuki GSXR1000 K5",
    cashAlternative: "Cash alternative: £12,000",
    ticketPrice: "£9.99",
    soldLabel: "38%",
    daysLeft: "1",
    daysLabel: "Day left",
  },
];

export function LpPhonePreview() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto w-full max-w-[340px] max-h-[620px] overflow-hidden rounded-[42px] border-[11px] border-neutral-900 dark:border-neutral-700 bg-rr-surface shadow-2xl dark:shadow-none dark:ring-1 dark:ring-white/10"
    >
      <div className="flex items-center justify-between border-b border-rr-border px-4 py-3">
        <span className="flex items-center gap-2 text-rr-primary">
          <Image
            src="/favnew.svg"
            alt=""
            width={26}
            height={26}
            className="h-[26px] w-[26px]"
          />
          <span className="text-[13px] font-semibold tracking-[-0.3px]">
            RAFFLE<span className="text-rr-green">RADAR</span>
          </span>
        </span>
        <IconMenu2 size={18} className="text-rr-primary" />
      </div>

      <p className="px-4 pb-2 pt-4 text-[17px] font-semibold tracking-[-0.02em] text-rr-primary">
        Undersold competitions
      </p>

      <div className="grid gap-3.5 px-4 pb-5">
        {cards.map((card) => (
          <article
            key={card.title}
            className="overflow-hidden rounded-xl border border-rr-border bg-rr-elevated"
          >
            <div className="relative aspect-[16/10] bg-rr-elevated">
              <Image
                src={card.image}
                alt={card.alt}
                fill
                sizes="320px"
                className="object-cover"
              />
              <span className="absolute left-2.5 top-2.5 rounded-md bg-rr-green px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.05em] text-rr-on-accent">
                {card.soldLabel} sold
              </span>
            </div>
            <div className="px-3 pb-3 pt-2.5">
              <h4 className="text-[14px] font-semibold leading-tight tracking-[-0.01em] text-rr-primary">
                {card.title}
              </h4>
              <p className="mt-0.5 text-[12px] text-rr-muted">{card.cashAlternative}</p>
              <div className="mt-2.5 flex items-end justify-between">
                <span className="block">
                  <b className="block text-[14px] font-semibold leading-tight text-rr-primary">
                    {card.ticketPrice}
                  </b>
                  <span className="text-[11px] text-rr-muted">Ticket price</span>
                </span>
                <span className="block">
                  <b className="block text-[14px] font-semibold leading-tight text-rr-primary">
                    {card.soldLabel}
                  </b>
                  <span className="text-[11px] text-rr-muted">Sold</span>
                </span>
                <span className="block">
                  <b className="block text-[14px] font-semibold leading-tight text-rr-primary">
                    {card.daysLeft}
                  </b>
                  <span className="text-[11px] text-rr-muted">{card.daysLabel}</span>
                </span>
                <IconBookmark size={18} className="text-rr-green" />
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-rr-surface to-transparent" />
    </div>
  );
}

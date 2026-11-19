import type { Metadata } from "next";
import { OffersList } from "@/components/offers/offers-list";
import { getCurrentOffers } from "@/sanity/offers";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "UK Competition Voucher Codes & Discounts | RaffleRadar",
    description:
      "Find voucher codes and special offers from approved UK prize competition operators. Check eligibility, offer terms and how to claim each deal.",
    alternates: { canonical: "/offers" },
  };
}

export default async function OffersPage() {
  const offers = await getCurrentOffers();

  return (
    <main className="bg-rr-bg">
      <section
        aria-labelledby="offers-title"
        className="bg-gradient-to-b from-rr-surface to-rr-bg"
      >
        <div className="container py-8 md:py-14">
          <div className="mx-auto max-w-[1100px]">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-rr-green md:mb-4">
              UK Prize Competition Discount Codes
            </p>
            <h1
              id="offers-title"
              className="text-2xl font-medium leading-[1.1] tracking-[-0.03em] text-rr-primary md:text-5xl md:leading-[1.05]"
            >
              UK Competition{" "}
              <span className="text-rr-green">
                Voucher Codes &amp; Discounts
              </span>
            </h1>
            <p className="mt-3 max-w-[800px] text-sm leading-6 text-rr-secondary md:mt-6 md:text-lg md:leading-7">
              Browse voucher codes, discount codes and special offers from
              approved UK prize competition operators. Check what each offer
              covers, who can use it and how to claim it.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-12 pt-6 md:pb-16 md:pt-4">
        <div className="container">
          <div className="mx-auto max-w-[1100px]">
            <OffersList offers={offers} />
            <p className="mt-6 text-xs text-rr-muted">
              Offers are provided by the operators. Check their terms before
              using an offer.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

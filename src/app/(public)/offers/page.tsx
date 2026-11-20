import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
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
      <PageHero
        eyebrow="UK Prize Competition Discount Codes"
        titleId="offers-title"
        title={
          <>
            UK Competition{" "}
            <span className="text-rr-green">Voucher Codes &amp; Discounts</span>
          </>
        }
        lead="Browse voucher codes, discount codes and special offers from approved UK prize competition operators. Check what each offer covers, who can use it and how to claim it."
      />

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

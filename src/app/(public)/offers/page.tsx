import type { Metadata } from "next";
import Image from "next/image";
import { OffersList } from "@/components/offers/offers-list";
import { ScrollTopLink } from "@/components/ui/scroll-top-link";
import { getCurrentOffers } from "@/sanity/offers";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Operator Offers and Promo Codes | RaffleRadar",
    description:
      "Discounts and promo codes from UK prize competition operators, with terms and end dates in one place.",
    alternates: { canonical: "/offers" },
  };
}

export default async function OffersPage() {
  const offers = await getCurrentOffers();

  return (
    <main className="bg-rr-bg">
      <div className="container pb-12 pt-6 md:pb-16 md:pt-8">
        <div className="mx-auto max-w-[1100px]">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex items-center gap-2.5 text-sm text-rr-muted"
          >
            <ScrollTopLink
              href="/"
              className="text-rr-muted no-underline hover:text-rr-primary"
            >
              Home
            </ScrollTopLink>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-rr-primary">
              Offers
            </span>
          </nav>

          <section
            aria-labelledby="offers-title"
            className="relative isolate overflow-hidden rounded-2xl border border-[#254232] bg-[#030706] px-6 py-10 md:min-h-[250px] md:px-14 md:py-12"
          >
            <Image
              src="/images/offers-hero.webp"
              alt=""
              width={900}
              height={900}
              priority
              className="pointer-events-none absolute -right-6 -top-10 -z-20 h-[230px] w-[230px] object-cover md:-right-2 md:top-1/2 md:h-[460px] md:w-[460px] md:-translate-y-[38%]"
            />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#030706] via-[#030706]/80 to-transparent" />
            <div className="flex h-full flex-col justify-center">
              <h1
                id="offers-title"
                className="text-[38px] font-extrabold leading-[1.02] tracking-[-0.055em] text-white md:text-[64px]"
              >
                Operator <span className="text-[#56dd78]">Offers</span>
              </h1>
              <p className="mt-3 max-w-[440px] text-base text-[#d0dcd5] md:mt-4 md:text-lg">
                Browse discounts and promo codes from UK prize competition
                operators.
              </p>
            </div>
          </section>

          <div className="mt-9">
            <OffersList offers={offers} />
          </div>

          <p className="mt-6 text-xs text-rr-muted">
            Offers are provided by the operators. Check their terms before using
            an offer.
          </p>
        </div>
      </div>
    </main>
  );
}

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
      <section
        aria-labelledby="offers-title"
        className="relative isolate overflow-hidden"
      >
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-rr-surface to-rr-bg" />
        <div className="container py-6 md:py-14">
          <div className="relative mx-auto max-w-[1100px]">
            <Image
              src="/images/offers-hero.webp"
              alt=""
              width={900}
              height={900}
              priority
              className="pointer-events-none absolute -right-4 top-[calc(50%+22px)] -z-10 h-[240px] w-[240px] -translate-y-1/2 mix-blend-multiply hue-rotate-180 invert [mask-image:radial-gradient(circle_closest-side_at_66%_44%,black_50%,transparent_85%)] dark:mix-blend-screen dark:hue-rotate-0 dark:invert-0 md:-right-20 md:top-[calc(50%+62px)] md:h-[640px] md:w-[640px]"
            />
            <div className="max-w-[210px] sm:max-w-[420px] md:max-w-[760px]">
              <nav
                aria-label="Breadcrumb"
                className="mb-2 flex items-center gap-2.5 text-sm text-rr-muted md:mb-4"
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
              <h1
                id="offers-title"
                className="text-2xl font-medium leading-[1.1] tracking-[-0.03em] text-rr-primary md:text-6xl md:leading-[1.05]"
              >
                Operator <span className="text-rr-green">Offers</span>
              </h1>
              <p className="mt-2 max-w-[600px] text-sm leading-6 text-rr-secondary md:mt-6 md:text-lg md:leading-7">
                Browse discounts and promo codes from UK prize competition
                operators.
              </p>
            </div>
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

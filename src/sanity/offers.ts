import { sanityClient, urlFor } from "@/sanity/client";

export const CURRENT_OFFERS = `*[_type == "offer" && isVisible != false && (!defined(endsAt) || dateTime(endsAt) > dateTime(now()))] | order(_createdAt desc){
  _id,
  _createdAt,
  operatorName,
  operatorId,
  logo,
  "profileLogo": *[_type == "operatorProfile" && defined(^.operatorId) && operatorId == ^.operatorId][0].logo,
  title,
  promoCode,
  url,
  endsAt,
  terms
}`;

type OfferDocument = {
  _id: string;
  _createdAt: string;
  operatorName?: string | null;
  operatorId?: string | null;
  logo?: unknown;
  profileLogo?: unknown;
  title?: string | null;
  promoCode?: string | null;
  url?: string | null;
  endsAt?: string | null;
  terms?: string | null;
};

export type OfferCardData = {
  id: string;
  createdAt: string;
  operatorName: string;
  operatorId: string | null;
  logoUrl: string | null;
  title: string;
  promoCode: string | null;
  url: string;
  endsAt: string | null;
  terms: string | null;
};

function logoUrl(source: unknown): string | null {
  if (!source || typeof source !== "object") return null;
  try {
    return urlFor(source as Parameters<typeof urlFor>[0])
      .width(96)
      .height(96)
      .fit("max")
      .auto("format")
      .url();
  } catch {
    return null;
  }
}

function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function toCard(doc: OfferDocument): OfferCardData | null {
  const operatorName = doc.operatorName?.trim();
  const title = doc.title?.trim();
  const url = safeUrl(doc.url);
  if (!operatorName || !title || !url) return null;

  return {
    id: doc._id,
    createdAt: doc._createdAt,
    operatorName,
    operatorId: doc.operatorId?.trim() || null,
    logoUrl: logoUrl(doc.logo) ?? logoUrl(doc.profileLogo),
    title,
    promoCode: doc.promoCode?.trim() || null,
    url,
    endsAt: doc.endsAt ?? null,
    terms: doc.terms?.trim() || null,
  };
}

export async function getCurrentOffers(): Promise<OfferCardData[]> {
  try {
    const docs = await sanityClient.fetch<OfferDocument[] | null>(
      CURRENT_OFFERS,
      {},
      { next: { revalidate: 60 } },
    );
    if (!Array.isArray(docs)) return [];
    return docs.flatMap((doc) => {
      const card = toCard(doc);
      return card ? [card] : [];
    });
  } catch {
    return [];
  }
}

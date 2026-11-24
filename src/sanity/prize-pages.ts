import { sanityClient } from "@/sanity/client";

const PRIZE_PAGE_CONTENT = `*[_type == "prizePage" && prizeKey == $key][0]{
  seoTitle,
  seoDescription,
  intro,
  faqs[]{ _key, question, answer }
}`;

const CONTENT_TTL = 300;

type PrizePageDocument = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  intro?: string | null;
  faqs?: Array<{
    _key?: string | null;
    question?: string | null;
    answer?: string | null;
  }> | null;
};

export type PrizePageFaq = {
  key: string;
  question: string;
  answer: string;
};

export type PrizePageContent = {
  seoTitle: string | null;
  seoDescription: string | null;
  intro: string | null;
  faqs: PrizePageFaq[];
};

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export async function getPrizePageContent(
  key: string,
): Promise<PrizePageContent | null> {
  let doc: PrizePageDocument | null = null;

  try {
    doc = await sanityClient.fetch<PrizePageDocument | null>(
      PRIZE_PAGE_CONTENT,
      { key },
      { next: { revalidate: CONTENT_TTL } },
    );
  } catch {
    return null;
  }

  if (!doc) return null;

  const faqs: PrizePageFaq[] = [];
  for (const [index, faq] of (doc.faqs ?? []).entries()) {
    const question = clean(faq.question);
    const answer = clean(faq.answer);
    if (question && answer) {
      faqs.push({ key: faq._key ?? String(index), question, answer });
    }
  }

  return {
    seoTitle: clean(doc.seoTitle),
    seoDescription: clean(doc.seoDescription),
    intro: clean(doc.intro),
    faqs,
  };
}

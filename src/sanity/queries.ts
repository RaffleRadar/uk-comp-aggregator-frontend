import { sanityClient, urlFor } from "@/sanity/client";

export const PAGE_BY_SLUG = `*[_type == "page" && slug.current == $slug][0]{
  title,
  heroEyebrow,
  heroHeading,
  richTitle,
  heroHeadingColor,
  heroLead,
  heroCtaPrimary,
  heroCtaSecondary,
  sections[]{..., _type},
  seo
}`;

export const ALL_PAGE_SLUGS = `*[_type == "page" && defined(slug.current)][].slug.current`;

export const ALL_REVIEWS = `*[_type == "review" && defined(slug.current)] | order(publishedAt desc){
  _id,
  title,
  slug,
  operatorName,
  heroImage,
  excerpt,
  rating,
  publishedAt
}`;

export const REVIEW_BY_SLUG = `*[_type == "review" && slug.current == $slug][0]{
  title,
  richTtitle,
  richTitle,
  titleColor,
  slug,
  operatorName,
  operatorId,
  heroImage,
  excerpt,
  rating,
  body,
  publishedAt,
  seo
}`;

export const ALL_REVIEW_SLUGS = `*[_type == "review" && defined(slug.current)][].slug.current`;

export const RELATED_REVIEWS = `*[_type == "review" && defined(slug.current) && slug.current != $slug] | order(publishedAt desc)[0...3]{
  _id,
  title,
  slug,
  operatorName,
  heroImage,
  excerpt,
  rating,
  publishedAt
}`;

export const OPERATOR_REVIEW_BY_ID = `*[_type == "review" && defined(slug.current) && operatorId == $operatorId] | order(publishedAt desc)[0]{
  title,
  slug,
  operatorName,
  excerpt,
  publishedAt
}`;

export const OPERATOR_REVIEW_BY_NAME = `*[_type == "review" && defined(slug.current) && lower(operatorName) in $operatorNames] | order(publishedAt desc)[0]{
  title,
  slug,
  operatorName,
  excerpt,
  publishedAt
}`;

const OPERATOR_PROFILE_FIELDS = `
  operatorId,
  operatorName,
  logo,
  registeredCompanyName,
  companiesHouseNumber,
  foundedYear,
  location,
  verified,
  drawMethod,
  drawSchedule,
  freeEntryUrl,
  postalFreeEntry,
  paymentMethods,
  prizeDelivery,
  voluntaryCodeMembership,
  responsiblePlayControls,
  publicEntryLists,
  winnersPublished,
  shortDescription,
  fullProfile,
  pros,
  cons,
  bestFor,
  trustpilotUrl,
  trustpilotScore,
  facebookUrl,
  instagramUrl,
  tiktokUrl,
  youtubeUrl,
  supportEmail
`;

export const OPERATOR_PROFILE_BY_ID = `*[_type == "operatorProfile" && operatorId == $operatorId][0]{${OPERATOR_PROFILE_FIELDS}}`;

export const OPERATOR_PROFILE_BY_NAME = `*[_type == "operatorProfile" && lower(operatorName) in $operatorNames][0]{${OPERATOR_PROFILE_FIELDS}}`;

export const OPERATOR_PROFILE_LOGOS = `*[_type == "operatorProfile" && defined(logo)]{
  operatorId,
  operatorName,
  logo
}`;

export const ALL_POSTS = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc){
  _id,
  title,
  richTitle,
  titleColor,
  slug,
  heroImage,
  excerpt,
  category,
  publishedAt
}`;

export const POST_BY_SLUG = `*[_type == "post" && slug.current == $slug][0]{
  title,
  richTitle,
  titleColor,
  slug,
  heroImage,
  excerpt,
  category,
  body,
  publishedAt,
  seo
}`;

export const ALL_POST_SLUGS = `*[_type == "post" && defined(slug.current)][].slug.current`;

export const RELATED_POSTS = `*[_type == "post" && defined(slug.current) && slug.current != $slug] | order(publishedAt desc)[0...3]{
  _id,
  title,
  richTitle,
  titleColor,
  slug,
  heroImage,
  excerpt,
  category,
  publishedAt
}`;

export const SITE_SETTINGS = `*[_type == "siteSettings"][0]{
  footerColumns[]{
    heading,
    links[]{
      label,
      href
    }
  },
  footerLinks[]{
    label,
    href
  },
  footerCopyright,
  footerDisclaimer,
  footerTagline,
  ogImage,
  maintenanceMessage
}`;

export const SITE_CONTENT = `*[_type == "siteContent"][0]{
  heroEyebrow,
  heroHeadingMobile,
  heroHeadingDesktop,
  heroSubheading,
  heroEyebrowMobile,
  heroSubheadingMobile,
  quickActionsTitle,
  section1TitleStart,
  section1TitleAccent,
  section1Subtitle,
  section2TitleStart,
  section2TitleAccent,
  section2Subtitle,
  section3TitleStart,
  section3TitleAccent,
  section3Subtitle,
  section4TitleStart,
  section4TitleAccent,
  section4Subtitle,
  section5TitleStart,
  section5TitleAccent,
  section5Subtitle,
  section6TitleStart,
  section6TitleAccent,
  section6Subtitle,
  competitionsIntro,
  operatorsIntro,
  reviewsIntro,
  blogIntro
}`;

export const HOW_IT_WORKS_PAGE = `*[_type == "howItWorksPage"][0]{
  title,
  heroEyebrow,
  richTitle,
  heroHeadingColor,
  heroLead,
  body
}`;

type SiteContentData = {
  heroEyebrow?: string | null;
  heroHeadingMobile?: string | null;
  heroHeadingDesktop?: string | null;
  heroSubheading?: string | null;
  heroEyebrowMobile?: string | null;
  heroSubheadingMobile?: string | null;
  quickActionsTitle?: string | null;
  section1TitleStart?: string | null;
  section1TitleAccent?: string | null;
  section1Subtitle?: string | null;
  section2TitleStart?: string | null;
  section2TitleAccent?: string | null;
  section2Subtitle?: string | null;
  section3TitleStart?: string | null;
  section3TitleAccent?: string | null;
  section3Subtitle?: string | null;
  section4TitleStart?: string | null;
  section4TitleAccent?: string | null;
  section4Subtitle?: string | null;
  section5TitleStart?: string | null;
  section5TitleAccent?: string | null;
  section5Subtitle?: string | null;
  section6TitleStart?: string | null;
  section6TitleAccent?: string | null;
  section6Subtitle?: string | null;
  competitionsIntro?: string | null;
  operatorsIntro?: string | null;
  reviewsIntro?: string | null;
  blogIntro?: string | null;
};

type OgImageSettingsData = {
  ogImage?: unknown;
};

export async function getSiteContent(): Promise<SiteContentData | null> {
  try {
    return await sanityClient.fetch<SiteContentData | null>(SITE_CONTENT, {}, { next: { revalidate: 60 } });
  } catch {
    return null;
  }
}

export async function getOgImageUrl(): Promise<string | null> {
  try {
    const settings = await sanityClient.fetch<OgImageSettingsData | null>(
      SITE_SETTINGS,
      {},
      { next: { revalidate: 3600 } },
    );

    if (!settings?.ogImage) {
      return null;
    }

    return urlFor(settings.ogImage).width(1200).height(630).fit("crop").auto("format").url();
  } catch {
    return null;
  }
}

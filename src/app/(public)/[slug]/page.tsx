import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/sanity/PageRenderer";
import { sanityClient } from "@/sanity/client";
import { ALL_PAGE_SLUGS, PAGE_BY_SLUG } from "@/sanity/queries";

export const revalidate = 3600;

type PageParams = {
  slug: string;
};

type SeoMeta = {
  seoTitle?: string;
  seoDescription?: string;
};

type CtaLink = {
  label: string;
  href: string;
};

type PageSection = {
  _key?: string;
  _type: string;
} & Record<string, unknown>;

type CmsPage = {
  title: string;
  heroEyebrow?: string;
  heroHeading: string;
  heroHeadingColor?: string | null;
  heroLead?: string;
  heroCtaPrimary?: CtaLink;
  heroCtaSecondary?: CtaLink;
  sections?: PageSection[];
  seo?: SeoMeta;
};

export async function generateStaticParams() {
  const slugs = await sanityClient.fetch<string[]>(ALL_PAGE_SLUGS);

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await sanityClient.fetch<CmsPage | null>(PAGE_BY_SLUG, { slug });

  if (!page) {
    return {};
  }

  return {
    title: page.seo?.seoTitle ?? page.title,
    description: page.seo?.seoDescription,
    alternates: { canonical: `/${slug}` },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const page = await sanityClient.fetch<CmsPage | null>(PAGE_BY_SLUG, { slug });

  if (!page) {
    notFound();
  }

  return <PageRenderer page={page} />;
}

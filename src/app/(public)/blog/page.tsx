import type { Metadata } from "next";
import { FeaturedPostCard } from "@/components/sanity/FeaturedPostCard";
import { PostCard } from "@/components/sanity/PostCard";
import { ClassicPagination } from "@/components/ui/ClassicPagination";
import { paginate } from "@/lib/classic-pagination";
import { sanityClient } from "@/sanity/client";
import { ALL_POSTS } from "@/sanity/queries";
import { getSiteContent } from "@/sanity/queries";

export const revalidate = 60;

type PostSlug = {
  current: string;
};

type PostListItem = {
  _id: string;
  title: string;
  richTitle?: unknown[] | null;
  titleColor?: string | null;
  slug: PostSlug;
  heroImage?: unknown;
  excerpt: string;
  category?: string | null;
  publishedAt: string;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Blog — RaffleRadar",
    description: "Analysis, industry news, and tips on UK competitions.",
    alternates: { canonical: "/blog" },
  };
}

const PAGE_SIZE = 9;

type BlogPageSearchParams = {
  page?: string;
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<BlogPageSearchParams>;
}) {
  const sp = await searchParams;
  const page = Number(sp?.page) || 1;
  let blogIntro =
    "Honest analysis, industry news and practical tips on UK prize competitions — so you know which draws are worth entering, and which to walk past.";
  let posts: PostListItem[] = [];

  try {
    const [postsResult, siteContent] = await Promise.all([
      sanityClient.fetch<PostListItem[]>(ALL_POSTS, {}, { next: { revalidate: 3600 } }),
      getSiteContent(),
    ]);
    posts = postsResult;
    blogIntro =
      siteContent?.blogIntro?.trim() ||
      "Honest analysis, industry news and practical tips on UK prize competitions — so you know which draws are worth entering, and which to walk past.";
  } catch {
    posts = [];
  }

  const [featuredPost, ...previousPosts] = posts;
  const mobilePagination = paginate(posts, page, PAGE_SIZE);
  const desktopPagination = paginate(previousPosts, page, PAGE_SIZE);

  return (
    <main className="bg-rr-bg">
      <section className="bg-gradient-to-b from-rr-surface to-rr-bg">
        <div className="container py-8 md:py-14">
          <div className="mx-auto max-w-[1100px]">
            <div className="max-w-[760px]">
            <p className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-rr-green md:mb-4">
              <span className="h-px w-8 bg-rr-green" />
              The RaffleRadar Blog
            </p>
            <h1 className="text-2xl font-medium leading-[1.1] tracking-[-0.03em] text-rr-primary md:text-6xl md:leading-[1.05]">
              Read the <span className="text-rr-green">small print</span> before you buy a ticket.
            </h1>
            <p className="mt-3 hidden max-w-[600px] text-base leading-7 text-rr-secondary md:mt-6 md:block md:text-lg">
              {blogIntro}
            </p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12 pt-6 md:pb-16 md:pt-4">
        <div className="container">
          <div className="mx-auto max-w-[1100px]">
          {!posts.length ? (
            <div className="py-20 text-center text-rr-muted">No posts yet. Check back soon.</div>
          ) : (
            <div>
              <div className="md:hidden">
                <div className="grid grid-cols-1 gap-4">
                  {mobilePagination.items.map((post) => (
                    <PostCard
                      key={post._id}
                      title={post.title}
                      richTitle={post.richTitle}
                      titleColor={post.titleColor}
                      slug={post.slug}
                      heroImage={post.heroImage}
                      excerpt={post.excerpt}
                      category={post.category}
                      publishedAt={post.publishedAt}
                    />
                  ))}
                </div>
                <ClassicPagination
                  currentPage={mobilePagination.currentPage}
                  totalPages={mobilePagination.totalPages}
                  basePath="/blog"
                />
              </div>

              <div className="hidden md:block">
                {desktopPagination.currentPage === 1 && featuredPost ? (
                  <div>
                    <p className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-rr-green">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-rr-green" />
                      Latest
                    </p>
                    <FeaturedPostCard
                      title={featuredPost.title}
                      richTitle={featuredPost.richTitle}
                      titleColor={featuredPost.titleColor}
                      slug={featuredPost.slug}
                      heroImage={featuredPost.heroImage}
                      excerpt={featuredPost.excerpt}
                      category={featuredPost.category}
                      publishedAt={featuredPost.publishedAt}
                    />
                  </div>
                ) : null}

                {desktopPagination.items.length ? (
                  <section className="mt-14">
                    <h2 className="mb-6 text-2xl font-medium tracking-[-0.02em] text-rr-primary">
                      Previous articles
                    </h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {desktopPagination.items.map((post) => (
                        <PostCard
                          key={post._id}
                          title={post.title}
                          richTitle={post.richTitle}
                          titleColor={post.titleColor}
                          slug={post.slug}
                          heroImage={post.heroImage}
                          excerpt={post.excerpt}
                          category={post.category}
                          publishedAt={post.publishedAt}
                        />
                      ))}
                    </div>
                    <ClassicPagination
                      currentPage={desktopPagination.currentPage}
                      totalPages={desktopPagination.totalPages}
                      basePath="/blog"
                    />
                  </section>
                ) : null}
              </div>
            </div>
          )}
          </div>
        </div>
      </section>
    </main>
  );
}

import { PageHero } from "@/components/shared/PageHero";
import { EmptyProducts } from "@/components/shared/EmptyStates";
import { CTABanner } from "@/components/shared/CTABanner";
import { NewsletterSection } from "@/components/shared/NewsletterSection";
import { generateSEOMetadata } from "@/lib/seo/metadata";
import { prisma } from "@/lib/prisma";
import { getOptionalDefaultOrganizationId } from "@/lib/tenant";
import Link from "next/link";

export const metadata = generateSEOMetadata({
  title: "Blog",
  description: "Read our latest articles, tips, and news. Discover fashion trends, product guides, and lifestyle inspiration.",
  keywords: ["blog", "articles", "news", "tips", "lifestyle"],
});

async function getBlogPosts() {
  // BlogPost table doesn't exist in database yet - return empty array
  return { posts: [] };
}

export default async function BlogPage() {
  const { posts } = await getBlogPosts();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Blog" },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Blog"
        subtitle="Latest Articles"
        description="Discover fashion trends, product guides, and lifestyle inspiration."
        backgroundColor="#8B5CF6"
        gradient="from-violet-500 to-violet-600"
        breadcrumbItems={breadcrumbItems}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group"
              >
                <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  {post.featuredImage && (
                    <div className="aspect-video relative">
                      <img
                        src={post.featuredImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {post.category && (
                      <span className="text-xs font-semibold text-violet-600 mb-2 block">
                        {post.category.name}
                      </span>
                    )}
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{post.viewCount} views</span>
                      <span>{post.likeCount} likes</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyProducts />
        )}
      </div>

      <CTABanner
        title="Stay Updated"
        subtitle="Subscribe to Our Newsletter"
        description="Get the latest articles and news delivered to your inbox."
        buttonText="Subscribe"
        buttonLink="#newsletter"
        variant="primary"
      />

      <NewsletterSection />
    </div>
  );
}

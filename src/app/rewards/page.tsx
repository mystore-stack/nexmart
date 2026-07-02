import { PageHero } from "@/components/shared/PageHero";
import { CTABanner } from "@/components/shared/CTABanner";
import { NewsletterSection } from "@/components/shared/NewsletterSection";
import { generateSEOMetadata } from "@/lib/seo/metadata";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = generateSEOMetadata({
  title: "Rewards Program",
  description: "Join our rewards program and earn points on every purchase. Redeem points for discounts and exclusive perks.",
  keywords: ["rewards", "loyalty program", "points", "earn points", "redeem rewards"],
});

export default async function RewardsPage() {
  const session = await getCurrentUser();
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/rewards");
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Account", href: "/account" },
    { label: "Rewards" },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Rewards Program"
        subtitle="Earn Points, Get Rewards"
        description="Join our loyalty program and earn points on every purchase."
        backgroundColor="#10B981"
        gradient="from-emerald-500 to-emerald-600"
        breadcrumbItems={breadcrumbItems}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Points Balance */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-2xl p-8 mb-8 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold text-emerald-600">2,450 Points</h2>
              <p className="text-muted-foreground">Your current balance</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Points to next tier</p>
              <p className="font-semibold">550 points to Gold</p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="font-semibold text-lg mb-2">Earn Points</h3>
            <p className="text-muted-foreground text-sm">
              Earn 1 point for every 10 MAD spent on purchases
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="font-semibold text-lg mb-2">Get Rewards</h3>
            <p className="text-muted-foreground text-sm">
              Redeem points for discounts, free shipping, and exclusive products
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="font-semibold text-lg mb-2">Unlock Tiers</h3>
            <p className="text-muted-foreground text-sm">
              Progress through tiers for better rewards and perks
            </p>
          </div>
        </div>

        {/* Reward Tiers */}
        <h2 className="text-2xl font-bold mb-6">Reward Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border-2 border-gray-200 rounded-xl p-6">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🥉</div>
              <h3 className="font-bold text-xl">Bronze</h3>
              <p className="text-muted-foreground text-sm">0 - 999 points</p>
            </div>
            <ul className="space-y-2 text-sm">
              <li>✓ 1 point per 10 MAD</li>
              <li>✓ Free shipping on orders 500+</li>
            </ul>
          </div>
          <div className="bg-card border-2 border-emerald-500 rounded-xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full">
              Current
            </div>
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🥈</div>
              <h3 className="font-bold text-xl">Silver</h3>
              <p className="text-muted-foreground text-sm">1,000 - 2,999 points</p>
            </div>
            <ul className="space-y-2 text-sm">
              <li>✓ 1.5 points per 10 MAD</li>
              <li>✓ Free shipping on orders 300+</li>
              <li>✓ Birthday bonus</li>
            </ul>
          </div>
          <div className="bg-card border-2 border-yellow-400 rounded-xl p-6">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🥇</div>
              <h3 className="font-bold text-xl">Gold</h3>
              <p className="text-muted-foreground text-sm">3,000+ points</p>
            </div>
            <ul className="space-y-2 text-sm">
              <li>✓ 2 points per 10 MAD</li>
              <li>✓ Free shipping on all orders</li>
              <li>✓ Exclusive access</li>
              <li>✓ Priority support</li>
            </ul>
          </div>
        </div>
      </div>

      <CTABanner
        title="Start Earning Today"
        subtitle="Join the Program"
        description="Sign up or log in to start earning points on every purchase."
        buttonText="Shop Now"
        buttonLink="/products"
        variant="primary"
      />

      <NewsletterSection />
    </div>
  );
}

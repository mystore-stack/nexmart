import { PageHero } from "@/components/shared/PageHero";
import { EmptyProducts } from "@/components/shared/EmptyStates";
import { CTABanner } from "@/components/shared/CTABanner";
import { NewsletterSection } from "@/components/shared/NewsletterSection";
import { generateSEOMetadata } from "@/lib/seo/metadata";
import { prisma } from "@/lib/prisma";
import { getOptionalDefaultOrganizationId } from "@/lib/tenant";
import Link from "next/link";

export const metadata = generateSEOMetadata({
  title: "Gift Cards",
  description: "Give the perfect gift with NexMart gift cards. Available in various denominations. The gift that always fits.",
  keywords: ["gift cards", "gift vouchers", "gift certificates", "perfect gift"],
});

async function getGiftCards() {
  // GiftCard table doesn't exist in database yet - return empty array
  return { giftCards: [] };
}

export default async function GiftCardsPage() {
  const { giftCards } = await getGiftCards();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Gift Cards" },
  ];

  const denominations = [
    { amount: 100, label: "100 MAD", description: "Perfect for small treats" },
    { amount: 250, label: "250 MAD", description: "Great for accessories" },
    { amount: 500, label: "500 MAD", description: "Ideal for clothing" },
    { amount: 1000, label: "1000 MAD", description: "The ultimate gift" },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Gift Cards"
        subtitle="The Perfect Gift"
        description="Give the gift of choice with NexMart gift cards. Available in various denominations."
        backgroundColor="#F59E0B"
        gradient="from-amber-500 to-amber-600"
        breadcrumbItems={breadcrumbItems}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Gift Card Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {denominations.map((denom) => (
            <div
              key={denom.amount}
              className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="text-4xl font-bold text-amber-600 mb-2">
                {denom.amount} MAD
              </div>
              <div className="text-lg font-semibold mb-2">{denom.label}</div>
              <div className="text-sm text-muted-foreground mb-4">
                {denom.description}
              </div>
              <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                Purchase
              </button>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="font-semibold text-lg mb-2">Instant Delivery</h3>
            <p className="text-muted-foreground">
              Send gift cards instantly via email
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="font-semibold text-lg mb-2">No Expiration</h3>
            <p className="text-muted-foreground">
              Gift cards never expire
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="font-semibold text-lg mb-2">Flexible</h3>
            <p className="text-muted-foreground">
              Redeem on any purchase
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-card border border-border rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Choose Amount</h3>
              <p className="text-muted-foreground text-sm">
                Select the perfect denomination
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Personalize</h3>
              <p className="text-muted-foreground text-sm">
                Add a personal message
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Send</h3>
              <p className="text-muted-foreground text-sm">
                Deliver instantly via email
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-2">How do I redeem a gift card?</h3>
            <p className="text-muted-foreground">
              Enter your gift card code at checkout to apply the balance to your purchase.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-2">Do gift cards expire?</h3>
            <p className="text-muted-foreground">
              No, NexMart gift cards never expire. Use them whenever you want.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-2">Can I use multiple gift cards?</h3>
            <p className="text-muted-foreground">
              Yes, you can use multiple gift cards on a single purchase.
            </p>
          </div>
        </div>
      </div>

      <CTABanner
        title="Give the Perfect Gift"
        subtitle="Gift Cards Available"
        description="Choose from various denominations and give the gift of choice."
        buttonText="Buy Gift Card"
        buttonLink="/gift-cards"
        variant="gold"
      />

      <NewsletterSection />
    </div>
  );
}

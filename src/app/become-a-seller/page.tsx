import { PageHero } from "@/components/shared/PageHero";
import { CTABanner } from "@/components/shared/CTABanner";
import { NewsletterSection } from "@/components/shared/NewsletterSection";
import { generateSEOMetadata } from "@/lib/seo/metadata";
import Link from "next/link";

export const metadata = generateSEOMetadata({
  title: "Become a Seller",
  description: "Start selling on NexMart. Join our marketplace and reach thousands of customers. Easy setup, low fees, and powerful tools.",
  keywords: ["become a seller", "sell on nexmart", "vendor", "marketplace seller"],
});

export default async function BecomeASellerPage() {
  const benefits = [
    { icon: "🚀", title: "Quick Setup", description: "Start selling in minutes with our easy onboarding process" },
    { icon: "💰", title: "Low Fees", description: "Competitive commission rates starting at just 10%" },
    { icon: "📊", title: "Analytics", description: "Track your sales, inventory, and performance in real-time" },
    { icon: "🌍", title: "Wide Reach", description: "Access thousands of customers across Morocco" },
    { icon: "🔒", title: "Secure Payments", description: "Automated and secure payouts directly to your account" },
    { icon: "📱", title: "Mobile Friendly", description: "Manage your store from anywhere with our mobile app" },
  ];

  const steps = [
    { step: 1, title: "Create Account", description: "Sign up and complete your seller profile" },
    { step: 2, title: "Add Products", description: "Upload your products with photos and descriptions" },
    { step: 3, title: "Start Selling", description: "Receive orders and ship to customers" },
    { step: 4, title: "Get Paid", description: "Receive automatic payouts to your bank account" },
  ];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Become a Seller" },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Become a Seller"
        subtitle="Start Your Business Today"
        description="Join thousands of sellers on NexMart and grow your business with our powerful platform."
        backgroundColor="#0EA5E9"
        gradient="from-sky-500 to-sky-600"
        breadcrumbItems={breadcrumbItems}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Benefits */}
        <h2 className="text-2xl font-bold mb-6 text-center">Why Sell on NexMart?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="bg-card border border-border rounded-xl p-6 text-center">
              <div className="text-5xl mb-4">{benefit.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {steps.map((step) => (
            <div key={step.step} className="text-center">
              <div className="w-16 h-16 bg-sky-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {step.step}
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20 rounded-2xl p-8 mb-16 border border-sky-200 dark:border-sky-800">
          <h2 className="text-2xl font-bold mb-6 text-center">Simple, Transparent Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-border">
              <h3 className="font-bold text-xl mb-2">Starter</h3>
              <div className="text-3xl font-bold mb-4">10%</div>
              <p className="text-muted-foreground text-sm mb-4">Commission on sales</p>
              <ul className="space-y-2 text-sm">
                <li>✓ Up to 50 products</li>
                <li>✓ Basic analytics</li>
                <li>✓ Standard support</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-2 border-sky-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-xs px-3 py-1 rounded-full">
                Popular
              </div>
              <h3 className="font-bold text-xl mb-2">Professional</h3>
              <div className="text-3xl font-bold mb-4">8%</div>
              <p className="text-muted-foreground text-sm mb-4">Commission on sales</p>
              <ul className="space-y-2 text-sm">
                <li>✓ Up to 500 products</li>
                <li>✓ Advanced analytics</li>
                <li>✓ Priority support</li>
                <li>✓ Featured listings</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-border">
              <h3 className="font-bold text-xl mb-2">Enterprise</h3>
              <div className="text-3xl font-bold mb-4">Custom</div>
              <p className="text-muted-foreground text-sm mb-4">Contact for pricing</p>
              <ul className="space-y-2 text-sm">
                <li>✓ Unlimited products</li>
                <li>✓ Custom integrations</li>
                <li>✓ Dedicated support</li>
                <li>✓ API access</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center px-8 py-4 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl transition-colors"
          >
            Start Selling Today
          </Link>
        </div>
      </div>

      <CTABanner
        title="Ready to Start?"
        subtitle="Join Thousands of Sellers"
        description="Take the first step towards growing your business on NexMart."
        buttonText="Sign Up Now"
        buttonLink="/auth/signin"
        variant="primary"
      />

      <NewsletterSection />
    </div>
  );
}

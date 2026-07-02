import { PageHero } from "@/components/shared/PageHero";
import { CTABanner } from "@/components/shared/CTABanner";
import { NewsletterSection } from "@/components/shared/NewsletterSection";
import { generateSEOMetadata } from "@/lib/seo/metadata";
import Link from "next/link";

export const metadata = generateSEOMetadata({
  title: "Help Center",
  description: "Get help with your orders, account, and more. Find answers to common questions and contact our support team.",
  keywords: ["help", "support", "customer service", "faq", "contact"],
});

export default async function HelpCenterPage() {
  const helpCategories = [
    { name: "Orders", icon: "📦", description: "Track orders, returns, refunds" },
    { name: "Account", icon: "👤", description: "Profile, settings, security" },
    { name: "Payments", icon: "💳", description: "Payment methods, billing" },
    { name: "Shipping", icon: "🚚", description: "Delivery, tracking, locations" },
    { name: "Products", icon: "🛍️", description: "Product info, sizing, quality" },
    { name: "Returns", icon: "↩️", description: "Return policy, process" },
  ];

  const faqs = [
    {
      question: "How do I track my order?",
      answer: "You can track your order by logging into your account and viewing your order history, or use the tracking link sent to your email."
    },
    {
      question: "What is your return policy?",
      answer: "We offer 30-day returns on most items. Products must be unworn and in original packaging. Some items like personalized products cannot be returned."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days. Free shipping is available on orders over 500 MAD."
    },
    {
      question: "Can I change my order after placing it?",
      answer: "Orders can be modified within 1 hour of placement. After that, please contact our support team for assistance."
    },
  ];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Help Center" },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Help Center"
        subtitle="How Can We Help?"
        description="Find answers to common questions or contact our support team for assistance."
        backgroundColor="#0EA5E9"
        gradient="from-sky-500 to-sky-600"
        breadcrumbItems={breadcrumbItems}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Search */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full px-6 py-4 bg-card border border-border rounded-xl text-lg"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              🔍
            </button>
          </div>
        </div>

        {/* Help Categories */}
        <h2 className="text-2xl font-bold mb-6">Browse by Topic</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {helpCategories.map((category) => (
            <Link
              key={category.name}
              href={`/help-center/${category.name.toLowerCase()}`}
              className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-3">{category.icon}</div>
              <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
              <p className="text-xs text-muted-foreground">{category.description}</p>
            </Link>
          ))}
        </div>

        {/* FAQ */}
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4 mb-12">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-2">{faq.question}</h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20 rounded-2xl p-8 border border-sky-200 dark:border-sky-800">
          <h2 className="text-2xl font-bold mb-4 text-center">Still Need Help?</h2>
          <p className="text-center text-muted-foreground mb-6">
            Our support team is available 24/7 to assist you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/account"
              className="px-6 py-3 bg-card border border-border hover:bg-muted font-semibold rounded-lg transition-colors"
            >
              My Account
            </Link>
          </div>
        </div>
      </div>

      <CTABanner
        title="Need More Help?"
        subtitle="Contact Us"
        description="Our support team is here to help you with any questions or concerns."
        buttonText="Contact Support"
        buttonLink="/contact"
        variant="primary"
      />

      <NewsletterSection />
    </div>
  );
}

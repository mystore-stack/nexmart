import { PageHero } from "@/components/shared/PageHero";
import { CTABanner } from "@/components/shared/CTABanner";
import { NewsletterSection } from "@/components/shared/NewsletterSection";
import { generateSEOMetadata } from "@/lib/seo/metadata";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOptionalDefaultOrganizationId } from "@/lib/tenant";
import { redirect } from "next/navigation";

export const metadata = generateSEOMetadata({
  title: "Refer a Friend",
  description: "Share the love and earn rewards. Refer friends to NexMart and earn 100 MAD for each successful referral.",
  keywords: ["referral", "refer a friend", "invite friends", "earn rewards"],
});

async function getReferralData() {
  // Referral table doesn't exist in database yet - return null
  return null;
}

export default async function ReferralPage() {
  const session = await getCurrentUser();
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/referral");
  }

  const data = await getReferralData();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Account", href: "/account" },
    { label: "Referral" },
  ];

  return (
    <div className="min-h-screen">
      <PageHero
        title="Refer a Friend"
        subtitle="Earn 100 MAD Per Referral"
        description="Share NexMart with your friends and earn rewards for each successful referral."
        backgroundColor="#6366F1"
        gradient="from-indigo-500 to-indigo-600"
        breadcrumbItems={breadcrumbItems}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-3xl font-bold text-indigo-600 mb-1">
              {data?.totalEarnings || 0} MAD
            </div>
            <p className="text-muted-foreground text-sm">Total Earnings</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-3xl font-bold text-indigo-600 mb-1">
              {data?.referrals.length || 0}
            </div>
            <p className="text-muted-foreground text-sm">Successful Referrals</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-3xl font-bold text-indigo-600 mb-1">100 MAD</div>
            <p className="text-muted-foreground text-sm">Reward Per Referral</p>
          </div>
        </div>

        {/* Share Link */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-8 mb-8 border border-indigo-200 dark:border-indigo-800">
          <h2 className="text-xl font-bold mb-4">Your Referral Link</h2>
          <div className="flex gap-4">
            <input
              type="text"
              readOnly
              value="https://nexmart.ma/referral/ABC123"
              className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border border-border rounded-lg"
            />
            <button className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition-colors">
              Copy Link
            </button>
          </div>
        </div>

        {/* How It Works */}
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="font-semibold mb-2">Share Your Link</h3>
            <p className="text-muted-foreground text-sm">
              Send your unique referral link to friends
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="font-semibold mb-2">Friend Signs Up</h3>
            <p className="text-muted-foreground text-sm">
              Your friend creates an account and makes a purchase
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="font-semibold mb-2">You Get Rewarded</h3>
            <p className="text-muted-foreground text-sm">
              Earn 100 MAD credited to your account
            </p>
          </div>
        </div>

        {/* Recent Referrals */}
        {data?.referrals && data.referrals.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Recent Referrals</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {data.referrals.map((referral) => (
                    <tr key={referral.id} className="border-t border-border">
                      <td className="px-6 py-4 text-sm">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          referral.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {referral.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">
                        {referral.rewardAmount || 0} MAD
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <CTABanner
        title="Start Referring Today"
        subtitle="Unlimited Earnings"
        description="There's no limit to how much you can earn. Refer as many friends as you want."
        buttonText="Share Now"
        buttonLink="#"
        variant="primary"
      />

      <NewsletterSection />
    </div>
  );
}

// src/lib/automation/newsletter.ts — Weekly Newsletter Automation
import { prisma } from '@/lib/prisma';
import { EmailType } from '@prisma/client';
import { sendEmail } from '@/lib/email';

// Newsletter configuration
export interface NewsletterConfig {
  organizationId: string;
  subject: string;
  featuredProducts?: string[];
  topCategories?: string[];
  promoBanner?: string;
}

// Create weekly newsletter
export async function createWeeklyNewsletter(config: NewsletterConfig) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: config.organizationId },
      include: {
        User: {
          where: { role: 'ADMIN' },
          take: 1,
        },
      },
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    // Get top products from the last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const topProducts = await prisma.product.findMany({
      where: {
        organizationId: config.organizationId,
        published: true,
        OrderItem: {
          some: {
            order: {
              createdAt: { gte: oneWeekAgo },
            },
          },
        },
      },
      include: {
        OrderItem: {
          where: {
            order: {
              createdAt: { gte: oneWeekAgo },
            },
          },
        },
      },
      take: 5,
    });

    // Sort by sales count
    topProducts.sort((a, b) => b.OrderItem.length - a.OrderItem.length);

    // Get new products from the last week
    const newProducts = await prisma.product.findMany({
      where: {
        organizationId: config.organizationId,
        published: true,
        createdAt: { gte: oneWeekAgo },
      },
      take: 5,
    });

    // Get weekly sales stats
    const weeklyOrders = await prisma.order.findMany({
      where: {
        organizationId: config.organizationId,
        createdAt: { gte: oneWeekAgo },
      },
    });

    const totalSales = weeklyOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = weeklyOrders.length;

    // Generate newsletter content
    const html = await generateNewsletterHTML({
      organizationName: organization.name,
      subject: config.subject,
      topProducts,
      newProducts,
      totalSales,
      totalOrders,
      promoBanner: config.promoBanner,
    });

    // Send newsletter to all subscribers (users who opted in)
    const subscribers = await prisma.user.findMany({
      where: {
        Membership: {
          some: {
            organizationId: config.organizationId,
          },
        },
      },
      select: { id: true, email: true, name: true },
    });

    let sentCount = 0;
    for (const subscriber of subscribers) {
      try {
        await sendEmail({
          to: subscriber.email,
          subject: config.subject,
          html,
          type: EmailType.NEWSLETTER,
          userId: subscriber.id,
          organizationId: config.organizationId,
          metadata: {
            newsletterType: 'weekly',
            topProductsCount: topProducts.length,
            newProductsCount: newProducts.length,
          },
        });
        sentCount++;
      } catch (error) {
        console.error(`[Newsletter Error] Failed to send to ${subscriber.email}:`, error);
      }
    }

    console.log(`[Newsletter] Sent weekly newsletter to ${sentCount} subscribers`);
    return { sentCount, totalSubscribers: subscribers.length };
  } catch (error) {
    console.error('[Create Weekly Newsletter Error]:', error);
    throw error;
  }
}

// Generate newsletter HTML
async function generateNewsletterHTML(data: {
  organizationName: string;
  subject: string;
  topProducts: any[];
  newProducts: any[];
  totalSales: number;
  totalOrders: number;
  promoBanner?: string;
}) {
  const { newsletterTemplate } = await import('@/lib/email-templates');
  return newsletterTemplate(data);
}

// Schedule weekly newsletter (called by cron job)
export async function scheduleWeeklyNewsletters() {
  try {
    const organizations = await prisma.organization.findMany({
      where: {
        status: 'ACTIVE',
      },
    });

    const results = [];

    for (const organization of organizations) {
      try {
        const result = await createWeeklyNewsletter({
          organizationId: organization.id,
          subject: `📬 Newsletter Hebdomadaire - ${organization.name}`,
          promoBanner: 'Offre spéciale de la semaine !',
        });
        results.push({
          organizationId: organization.id,
          organizationName: organization.name,
          ...result,
        });
      } catch (error) {
        console.error(`[Newsletter Error] Failed for organization ${organization.id}:`, error);
        results.push({
          organizationId: organization.id,
          organizationName: organization.name,
          error: 'Failed to send newsletter',
        });
      }
    }

    console.log(`[Newsletter] Processed ${results.length} organizations`);
    return results;
  } catch (error) {
    console.error('[Schedule Weekly Newsletters Error]:', error);
    throw error;
  }
}

// Get newsletter statistics
export async function getNewsletterStatistics(organizationId?: string) {
  try {
    const where = organizationId ? { organizationId } : {};

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [
      totalNewsletters,
      weeklyNewsletters,
      totalOpens,
      totalClicks,
    ] = await Promise.all([
      prisma.emailLog.count({
        where: { ...where, type: EmailType.NEWSLETTER },
      }),
      prisma.emailLog.count({
        where: {
          ...where,
          type: EmailType.NEWSLETTER,
          createdAt: { gte: oneWeekAgo },
        },
      }),
      prisma.emailLog.count({
        where: { ...where, type: EmailType.NEWSLETTER, status: 'OPENED' },
      }),
      prisma.emailLog.count({
        where: { ...where, type: EmailType.NEWSLETTER, status: 'CLICKED' },
      }),
    ]);

    return {
      totalNewsletters,
      weeklyNewsletters,
      totalOpens,
      totalClicks,
      openRate: totalNewsletters > 0 ? (totalOpens / totalNewsletters) * 100 : 0,
      clickRate: totalNewsletters > 0 ? (totalClicks / totalNewsletters) * 100 : 0,
    };
  } catch (error) {
    console.error('[Get Newsletter Statistics Error]:', error);
    return null;
  }
}

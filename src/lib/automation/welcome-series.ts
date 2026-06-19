// src/lib/automation/welcome-series.ts — Welcome Email Series Automation
import { prisma } from '@/lib/prisma';
import { EmailType } from '@prisma/client';
import { sendWelcomeEmail } from '@/lib/email';

// Welcome email series configuration
const WELCOME_SERIES_CONFIG = {
  email1: {
    delayHours: 0, // Immediate on registration
    type: EmailType.WELCOME_1,
    subject: '🎉 Bienvenue sur NexMart Maroc !',
  },
  email2: {
    delayHours: 24, // 1 day after registration
    type: EmailType.WELCOME_2,
    subject: '🛍️ Découvrez nos meilleures offres',
  },
  email3: {
    delayHours: 72, // 3 days after registration
    type: EmailType.WELCOME_3,
    subject: '⭐ 5 astuces pour profiter au maximum de NexMart',
  },
  email4: {
    delayHours: 168, // 7 days after registration
    type: EmailType.WELCOME,
    subject: '🎁 Une offre exclusive pour vous',
  },
  email5: {
    delayHours: 336, // 14 days after registration
    type: EmailType.PROMO,
    subject: '🚀 Votre avis compte !',
  },
};

// Initialize welcome series for a new user
export async function initializeWelcomeSeries(userId: string, organizationId: string) {
  try {
    const existing = await prisma.welcomeSeries.findUnique({
      where: { userId },
    });

    if (existing) {
      return existing;
    }

    const welcomeSeries = await prisma.welcomeSeries.create({
      data: {
        userId,
        organizationId,
      },
    });

    // Send first email immediately
    await sendWelcomeEmail1(userId, organizationId);

    return welcomeSeries;
  } catch (error) {
    console.error('[Welcome Series Error]:', error);
    throw error;
  }
}

// Send welcome email 1 (immediate)
async function sendWelcomeEmail1(userId: string, organizationId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await sendWelcomeEmail(user.email, user.name, userId, organizationId);

    await prisma.welcomeSeries.update({
      where: { userId },
      data: {
        email1Sent: true,
        email1SentAt: new Date(),
      },
    });

    console.log(`[Welcome Series] Email 1 sent to ${user.email}`);
  } catch (error) {
    console.error('[Welcome Series Email 1 Error]:', error);
  }
}

// Process pending welcome emails (called by cron job)
export async function processWelcomeSeries() {
  try {
    const now = new Date();
    const pendingSeries = await prisma.welcomeSeries.findMany({
      where: {
        completed: false,
        OR: [
          { email1Sent: false },
          { email2Sent: false },
          { email3Sent: false },
          { email4Sent: false },
          { email5Sent: false },
        ],
      },
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
    });

    for (const series of pendingSeries) {
      const hoursSinceCreation = (now.getTime() - series.createdAt.getTime()) / (1000 * 60 * 60);

      // Check and send email 2 (24 hours)
      if (!series.email2Sent && hoursSinceCreation >= WELCOME_SERIES_CONFIG.email2.delayHours) {
        await sendWelcomeEmail2(series.userId, series.organizationId, series.user.email, series.user.name);
      }

      // Check and send email 3 (72 hours)
      if (!series.email3Sent && hoursSinceCreation >= WELCOME_SERIES_CONFIG.email3.delayHours) {
        await sendWelcomeEmail3(series.userId, series.organizationId, series.user.email, series.user.name);
      }

      // Check and send email 4 (168 hours)
      if (!series.email4Sent && hoursSinceCreation >= WELCOME_SERIES_CONFIG.email4.delayHours) {
        await sendWelcomeEmail4(series.userId, series.organizationId, series.user.email, series.user.name);
      }

      // Check and send email 5 (336 hours)
      if (!series.email5Sent && hoursSinceCreation >= WELCOME_SERIES_CONFIG.email5.delayHours) {
        await sendWelcomeEmail5(series.userId, series.organizationId, series.user.email, series.user.name);
      }

      // Check if series is complete
      const updatedSeries = await prisma.welcomeSeries.findUnique({
        where: { id: series.id },
      });

      if (updatedSeries &&
          updatedSeries.email1Sent &&
          updatedSeries.email2Sent &&
          updatedSeries.email3Sent &&
          updatedSeries.email4Sent &&
          updatedSeries.email5Sent) {
        await prisma.welcomeSeries.update({
          where: { id: series.id },
          data: {
            completed: true,
            completedAt: new Date(),
          },
        });
      }
    }

    console.log(`[Welcome Series] Processed ${pendingSeries.length} pending series`);
  } catch (error) {
    console.error('[Welcome Series Process Error]:', error);
  }
}

// Send welcome email 2 (24 hours after registration)
async function sendWelcomeEmail2(userId: string, organizationId: string, email: string, name: string) {
  try {
    const { sendEmail } = await import('@/lib/email');
    const { welcomeEmail2Template } = await import('@/lib/email-templates');

    const html = welcomeEmail2Template(name);

    await sendEmail({
      to: email,
      subject: WELCOME_SERIES_CONFIG.email2.subject,
      html,
      type: EmailType.WELCOME_2,
      userId,
      organizationId,
    });

    await prisma.welcomeSeries.update({
      where: { userId },
      data: {
        email2Sent: true,
        email2SentAt: new Date(),
      },
    });

    console.log(`[Welcome Series] Email 2 sent to ${email}`);
  } catch (error) {
    console.error('[Welcome Series Email 2 Error]:', error);
  }
}

// Send welcome email 3 (72 hours after registration)
async function sendWelcomeEmail3(userId: string, organizationId: string, email: string, name: string) {
  try {
    const { sendEmail } = await import('@/lib/email');
    const { welcomeEmail3Template } = await import('@/lib/email-templates');

    const html = welcomeEmail3Template(name);

    await sendEmail({
      to: email,
      subject: WELCOME_SERIES_CONFIG.email3.subject,
      html,
      type: EmailType.WELCOME_3,
      userId,
      organizationId,
    });

    await prisma.welcomeSeries.update({
      where: { userId },
      data: {
        email3Sent: true,
        email3SentAt: new Date(),
      },
    });

    console.log(`[Welcome Series] Email 3 sent to ${email}`);
  } catch (error) {
    console.error('[Welcome Series Email 3 Error]:', error);
  }
}

// Send welcome email 4 (168 hours after registration)
async function sendWelcomeEmail4(userId: string, organizationId: string, email: string, name: string) {
  try {
    const { sendEmail } = await import('@/lib/email');
    const { welcomeEmail4Template } = await import('@/lib/email-templates');

    const html = welcomeEmail4Template(name);

    await sendEmail({
      to: email,
      subject: WELCOME_SERIES_CONFIG.email4.subject,
      html,
      type: EmailType.WELCOME,
      userId,
      organizationId,
    });

    await prisma.welcomeSeries.update({
      where: { userId },
      data: {
        email4Sent: true,
        email4SentAt: new Date(),
      },
    });

    console.log(`[Welcome Series] Email 4 sent to ${email}`);
  } catch (error) {
    console.error('[Welcome Series Email 4 Error]:', error);
  }
}

// Send welcome email 5 (336 hours after registration)
async function sendWelcomeEmail5(userId: string, organizationId: string, email: string, name: string) {
  try {
    const { sendEmail } = await import('@/lib/email');
    const { welcomeEmail5Template } = await import('@/lib/email-templates');

    const html = welcomeEmail5Template(name);

    await sendEmail({
      to: email,
      subject: WELCOME_SERIES_CONFIG.email5.subject,
      html,
      type: EmailType.PROMO,
      userId,
      organizationId,
    });

    await prisma.welcomeSeries.update({
      where: { userId },
      data: {
        email5Sent: true,
        email5SentAt: new Date(),
      },
    });

    console.log(`[Welcome Series] Email 5 sent to ${email}`);
  } catch (error) {
    console.error('[Welcome Series Email 5 Error]:', error);
  }
}

// Get welcome series statistics
export async function getWelcomeSeriesStats(organizationId?: string) {
  const where = organizationId ? { organizationId } : {};

  const [
    totalSeries,
    completedSeries,
    email1Sent,
    email2Sent,
    email3Sent,
    email4Sent,
    email5Sent,
  ] = await Promise.all([
    prisma.welcomeSeries.count({ where }),
    prisma.welcomeSeries.count({ where: { ...where, completed: true } }),
    prisma.welcomeSeries.count({ where: { ...where, email1Sent: true } }),
    prisma.welcomeSeries.count({ where: { ...where, email2Sent: true } }),
    prisma.welcomeSeries.count({ where: { ...where, email3Sent: true } }),
    prisma.welcomeSeries.count({ where: { ...where, email4Sent: true } }),
    prisma.welcomeSeries.count({ where: { ...where, email5Sent: true } }),
  ]);

  return {
    totalSeries,
    completedSeries,
    completionRate: totalSeries > 0 ? (completedSeries / totalSeries) * 100 : 0,
    email1Sent,
    email2Sent,
    email3Sent,
    email4Sent,
    email5Sent,
  };
}

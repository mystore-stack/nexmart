// src/lib/automation/daily-reports.ts — Daily Sales Report System
import { prisma } from '@/lib/prisma';
import { sendDailySalesReportEmail } from '@/lib/email';

interface DailyReportConfig {
  adminEmail?: string;
  topProductsLimit?: number;
}

export async function generateDailySalesReport(config: DailyReportConfig = {}) {
  const {
    adminEmail = process.env.ADMIN_EMAIL || 'admin@nexmart.ma',
    topProductsLimit = 10,
  } = config;

  // Get all active organizations
  const organizations = await prisma.organization.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, name: true },
  });

  for (const organization of organizations) {
    await generateOrganizationReport(organization.id, organization.name, adminEmail, topProductsLimit);
  }
}

async function generateOrganizationReport(
  organizationId: string,
  organizationName: string,
  adminEmail: string,
  topProductsLimit: number
) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  // Check if report already exists for today
  const existingReport = await prisma.dailySalesReport.findUnique({
    where: {
      organizationId_reportDate: {
        organizationId,
        reportDate: startOfDay,
      },
    },
  });

  if (existingReport) {
    return; // Report already generated for today
  }

  // Calculate daily metrics
  const [orders, newCustomers, topProducts] = await Promise.all([
    // Get orders from today
    prisma.order.findMany({
      where: {
        organizationId,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      include: {
        items: true,
      },
    }),

    // Get new customers from today
    prisma.user.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    }),

    // Get top products by sales
    prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          organizationId,
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: topProductsLimit,
    }),
  ]);

  // Calculate totals
  const totalSales = orders.reduce((sum: number, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Get product names for top products
  const productIds = topProducts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });

  const topProductsWithNames = topProducts.map((p) => {
    const product = products.find((prod) => prod.id === p.productId);
    return {
      name: product?.name || 'Unknown',
      sold: p._sum.quantity || 0,
    };
  });

  // Additional metrics
  const metrics = {
    totalRevenue: totalSales,
    totalOrders,
    newCustomers,
    averageOrderValue,
    topProducts: topProductsWithNames,
    ordersByStatus: await getOrdersByStatus(organizationId, startOfDay, endOfDay),
    paymentMethods: await getPaymentMethodBreakdown(organizationId, startOfDay, endOfDay),
  };

  // Create daily report
  const report = await prisma.dailySalesReport.create({
    data: {
      organizationId,
      reportDate: startOfDay,
      totalSales,
      totalOrders,
      newCustomers,
      averageOrderValue,
      topProducts: topProductsWithNames,
      metrics,
      sent: false,
      recipients: [adminEmail],
    },
  });

  // Send report email
  try {
    await sendDailySalesReportEmail(
      adminEmail,
      totalSales,
      totalOrders,
      newCustomers,
      topProductsWithNames,
      organizationId
    );

    // Update report as sent
    await prisma.dailySalesReport.update({
      where: { id: report.id },
      data: {
        sent: true,
        sentAt: new Date(),
      },
    });
  } catch (error) {
    console.error(`[Daily Report Error] Organization ${organizationId}:`, error);
  }
}

async function getOrdersByStatus(organizationId: string, startOfDay: Date, endOfDay: Date) {
  const ordersByStatus = await prisma.order.groupBy({
    by: ['status'],
    where: {
      organizationId,
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
    _count: true,
  });

  return ordersByStatus.reduce((acc: any, item) => {
    acc[item.status] = item._count;
    return acc;
  }, {});
}

async function getPaymentMethodBreakdown(organizationId: string, startOfDay: Date, endOfDay: Date) {
  const paymentMethods = await prisma.order.groupBy({
    by: ['paymentMethod'],
    where: {
      organizationId,
      createdAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
    _count: true,
    _sum: {
      total: true,
    },
  });

  return paymentMethods.map((pm) => ({
    method: pm.paymentMethod,
    count: pm._count,
    total: pm._sum.total || 0,
  }));
}

export async function getDailyReports(organizationId?: string, limit = 30) {
  const where = organizationId ? { organizationId } : {};

  return prisma.dailySalesReport.findMany({
    where,
    orderBy: { reportDate: 'desc' },
    take: limit,
    include: {
      organization: {
        select: {
          name: true,
        },
      },
    },
  });
}

export async function getDailyReportStats(organizationId?: string) {
  const where = organizationId ? { organizationId } : {};

  const [totalReports, sentReports, pendingReports] = await Promise.all([
    prisma.dailySalesReport.count({ where }),
    prisma.dailySalesReport.count({ where: { ...where, sent: true } }),
    prisma.dailySalesReport.count({ where: { ...where, sent: false } }),
  ]);

  // Calculate total revenue from all reports
  const reports = await prisma.dailySalesReport.findMany({
    where,
    select: { totalSales: true },
  });
  const totalRevenue = reports.reduce((sum, report) => sum + report.totalSales, 0);

  return {
    totalReports,
    sentReports,
    pendingReports,
    totalRevenue,
  };
}

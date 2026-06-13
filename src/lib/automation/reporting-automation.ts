// src/lib/automation/reporting-automation.ts
// Reporting automation: daily/weekly/monthly reports, top products, inactive products, PDF export

import { prisma } from '../prisma';
import { addEmailJob } from '../queue';
import { logSuccess, logFailure, logPending } from './logger';
import { AutomationType, ReportType, ReportFrequency } from '@prisma/client';

/**
 * Architecture:
 * - Reporting automation generates scheduled reports
 * - Daily, weekly, and monthly sales reports
 * - Top-selling products reports
 * - Inactive products reports
 * - PDF export functionality
 * - Email delivery to recipients
 * - Uses queue system for async processing
 */

/**
 * Generate daily sales report
 * - Sales metrics for the day
 * - Order count, revenue, average order value
 */
export async function generateDailySalesReport(organizationId: string) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const orders = await prisma.order.findMany({
      where: {
        organizationId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
        },
      },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    const report = {
      date: today.toISOString().split('T')[0],
      totalOrders: orders.length,
      totalRevenue,
      averageOrderValue,
      ordersByStatus: orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    // Log success
    await logSuccess(
      organizationId,
      AutomationType.REPORT_GENERATION,
      'Report',
      `daily-${today.toISOString().split('T')[0]}`,
      'Daily sales report generated',
      report
    );

    return report;
  } catch (error) {
    await logFailure(
      organizationId,
      AutomationType.REPORT_GENERATION,
      'Report',
      'daily',
      'Daily sales report generation failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
}

/**
 * Generate weekly sales report
 * - Sales metrics for the week
 * - Comparison with previous week
 */
export async function generateWeeklySalesReport(organizationId: string) {
  try {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today.setDate(today.getDate() + 6));
    endOfWeek.setHours(23, 59, 59, 999);

    const orders = await prisma.order.findMany({
      where: {
        organizationId,
        createdAt: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
        },
      },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Get previous week for comparison
    const startOfPrevWeek = new Date(startOfWeek);
    startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);
    const endOfPrevWeek = new Date(endOfWeek);
    endOfPrevWeek.setDate(endOfPrevWeek.getDate() - 7);

    const prevOrders = await prisma.order.findMany({
      where: {
        organizationId,
        createdAt: {
          gte: startOfPrevWeek,
          lte: endOfPrevWeek,
        },
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
        },
      },
    });

    const prevRevenue = prevOrders.reduce((sum, order) => sum + order.total, 0);
    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const report = {
      weekStart: startOfWeek.toISOString().split('T')[0],
      weekEnd: endOfWeek.toISOString().split('T')[0],
      totalOrders: orders.length,
      totalRevenue,
      averageOrderValue,
      previousWeekRevenue: prevRevenue,
      revenueGrowth,
      ordersByStatus: orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    // Log success
    await logSuccess(
      organizationId,
      AutomationType.REPORT_GENERATION,
      'Report',
      `weekly-${startOfWeek.toISOString().split('T')[0]}`,
      'Weekly sales report generated',
      report
    );

    return report;
  } catch (error) {
    await logFailure(
      organizationId,
      AutomationType.REPORT_GENERATION,
      'Report',
      'weekly',
      'Weekly sales report generation failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
}

/**
 * Generate monthly sales report
 * - Sales metrics for the month
 * - Comparison with previous month
 */
export async function generateMonthlySalesReport(organizationId: string) {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const orders = await prisma.order.findMany({
      where: {
        organizationId,
        createdAt: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
        },
      },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Get previous month for comparison
    const startOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const prevOrders = await prisma.order.findMany({
      where: {
        organizationId,
        createdAt: {
          gte: startOfPrevMonth,
          lte: endOfPrevMonth,
        },
        status: {
          in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
        },
      },
    });

    const prevRevenue = prevOrders.reduce((sum, order) => sum + order.total, 0);
    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const report = {
      month: today.toLocaleString('default', { month: 'long', year: 'numeric' }),
      totalOrders: orders.length,
      totalRevenue,
      averageOrderValue,
      previousMonthRevenue: prevRevenue,
      revenueGrowth,
      ordersByStatus: orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    // Log success
    await logSuccess(
      organizationId,
      AutomationType.REPORT_GENERATION,
      'Report',
      `monthly-${today.getFullYear()}-${today.getMonth() + 1}`,
      'Monthly sales report generated',
      report
    );

    return report;
  } catch (error) {
    await logFailure(
      organizationId,
      AutomationType.REPORT_GENERATION,
      'Report',
      'monthly',
      'Monthly sales report generation failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
}

/**
 * Generate top-selling products report
 * - Products with highest sales
 * - Revenue and quantity sold
 */
export async function generateTopProductsReport(organizationId: string, limit: number = 10) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          organizationId,
          createdAt: { gte: thirtyDaysAgo },
          status: {
            in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
          },
        },
      },
      include: {
        product: true,
      },
    });

    const productSales = new Map<string, { product: any; quantity: number; revenue: number }>();

    for (const item of orderItems) {
      const existing = productSales.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
      } else {
        productSales.set(item.productId, {
          product: item.product,
          quantity: item.quantity,
          revenue: item.price * item.quantity,
        });
      }
    }

    const topProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    const report = {
      period: 'Last 30 days',
      topProducts: topProducts.map(p => ({
        id: p.product.id,
        name: p.product.name,
        sku: p.product.sku,
        quantitySold: p.quantity,
        revenue: p.revenue,
      })),
    };

    // Log success
    await logSuccess(
      organizationId,
      AutomationType.REPORT_GENERATION,
      'Report',
      'top-products',
      'Top products report generated',
      report
    );

    return report;
  } catch (error) {
    await logFailure(
      organizationId,
      AutomationType.REPORT_GENERATION,
      'Report',
      'top-products',
      'Top products report generation failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
}

/**
 * Generate inactive products report
 * - Products with no sales in specified period
 * - Low stock warning
 */
export async function generateInactiveProductsReport(organizationId: string, days: number = 30) {
  try {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const allProducts = await prisma.product.findMany({
      where: {
        organizationId,
        published: true,
      },
    });

    // Get products with sales in the period
    const soldProductIds = new Set(
      (
        await prisma.orderItem.findMany({
          where: {
            order: {
              organizationId,
              createdAt: { gte: cutoffDate },
              status: {
                in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'],
              },
            },
          },
          select: { productId: true },
        })
      ).map(item => item.productId)
    );

    const inactiveProducts = allProducts.filter(
      product => !soldProductIds.has(product.id)
    );

    const lowStockProducts = inactiveProducts.filter(
      product => product.stock <= product.lowStockAt
    );

    const report = {
      period: `Last ${days} days`,
      totalProducts: allProducts.length,
      inactiveCount: inactiveProducts.length,
      inactivePercentage: (inactiveProducts.length / allProducts.length) * 100,
      lowStockInactiveProducts: lowStockProducts.length,
      inactiveProducts: inactiveProducts.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        stock: p.stock,
        lowStockAt: p.lowStockAt,
        price: p.price,
      })),
    };

    // Log success
    await logSuccess(
      organizationId,
      AutomationType.REPORT_GENERATION,
      'Report',
      'inactive-products',
      'Inactive products report generated',
      report
    );

    return report;
  } catch (error) {
    await logFailure(
      organizationId,
      AutomationType.REPORT_GENERATION,
      'Report',
      'inactive-products',
      'Inactive products report generation failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
}

/**
 * Export report as PDF
 * - Generate PDF from report data
 * - Return PDF buffer
 */
export async function exportReportAsPDF(reportData: any, reportType: string) {
  try {
    // TODO: Implement PDF generation using a library like pdfkit or puppeteer
    // For now, return a placeholder
    return {
      reportType,
      data: reportData,
      // PDF buffer would be generated here
    };
  } catch (error) {
    console.error('[Export Report as PDF] Failed:', error);
    throw error;
  }
}

/**
 * Schedule report
 * - Create report schedule in database
 * - Set up recurring reports
 */
export async function scheduleReport(
  organizationId: string,
  type: ReportType,
  frequency: ReportFrequency,
  recipients: string[]
) {
  try {
    const nextRunAt = calculateNextRunDate(frequency);

    const schedule = await prisma.reportSchedule.create({
      data: {
        organizationId,
        type,
        frequency,
        recipients,
        nextRunAt,
        active: true,
      },
    });

    // Log success
    await logSuccess(
      organizationId,
      AutomationType.REPORT_GENERATION,
      'ReportSchedule',
      schedule.id,
      'Report schedule created',
      {
        type,
        frequency,
        nextRunAt,
      }
    );

    return schedule;
  } catch (error) {
    await logFailure(
      organizationId,
      AutomationType.REPORT_GENERATION,
      'ReportSchedule',
      'schedule',
      'Report schedule creation failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
    throw error;
  }
}

/**
 * Calculate next run date based on frequency
 */
function calculateNextRunDate(frequency: ReportFrequency): Date {
  const now = new Date();
  
  switch (frequency) {
    case 'DAILY':
      return new Date(now.setDate(now.getDate() + 1));
    case 'WEEKLY':
      return new Date(now.setDate(now.getDate() + 7));
    case 'MONTHLY':
      return new Date(now.setMonth(now.getMonth() + 1));
    default:
      return new Date(now.setDate(now.getDate() + 1));
  }
}

/**
 * Process scheduled reports
 * - Run all due reports
 * - Send to recipients
 */
export async function processScheduledReports() {
  try {
    const dueSchedules = await prisma.reportSchedule.findMany({
      where: {
        active: true,
        nextRunAt: {
          lte: new Date(),
        },
      },
    });

    for (const schedule of dueSchedules) {
      let reportData: any;

      switch (schedule.type) {
        case 'DAILY_SALES':
          reportData = await generateDailySalesReport(schedule.organizationId);
          break;
        case 'WEEKLY_SALES':
          reportData = await generateWeeklySalesReport(schedule.organizationId);
          break;
        case 'MONTHLY_SALES':
          reportData = await generateMonthlySalesReport(schedule.organizationId);
          break;
        case 'TOP_PRODUCTS':
          reportData = await generateTopProductsReport(schedule.organizationId);
          break;
        case 'INACTIVE_PRODUCTS':
          reportData = await generateInactiveProductsReport(schedule.organizationId);
          break;
        default:
          continue;
      }

      // Send report to recipients
      for (const recipient of schedule.recipients) {
        await addEmailJob({
          type: 'order_confirmation' as any,
          to: recipient,
          subject: `📊 ${schedule.type} Report`,
          template: 'report',
          data: {
            reportType: schedule.type,
            reportData,
          },
        });
      }

      // Update next run date
      await prisma.reportSchedule.update({
        where: { id: schedule.id },
        data: {
          lastRunAt: new Date(),
          nextRunAt: calculateNextRunDate(schedule.frequency),
        },
      });
    }

    return {
      processed: dueSchedules.length,
    };
  } catch (error) {
    console.error('[Process Scheduled Reports] Failed:', error);
    throw error;
  }
}

/**
 * Process reporting automation queue job
 * - Called by worker to process queued reporting automation
 */
export async function processReportingAutomationJob(jobData: any) {
  const { type, organizationId, reportType, frequency, recipients } = jobData;

  switch (type) {
    case 'daily_sales':
      return await generateDailySalesReport(organizationId);
    case 'weekly_sales':
      return await generateWeeklySalesReport(organizationId);
    case 'monthly_sales':
      return await generateMonthlySalesReport(organizationId);
    case 'top_products':
      return await generateTopProductsReport(organizationId, jobData.limit);
    case 'inactive_products':
      return await generateInactiveProductsReport(organizationId, jobData.days);
    case 'schedule_report':
      return await scheduleReport(organizationId, reportType, frequency, recipients);
    case 'process_scheduled':
      return await processScheduledReports();
    default:
      throw new Error(`Unknown reporting automation type: ${type}`);
  }
}

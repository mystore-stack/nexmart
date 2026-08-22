// src/app/api/admin/analytics/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-api';
import { getExecutiveMetrics, getInventoryMetrics } from '@/lib/services/executive-analytics.service';
import { subDays, startOfDay } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { getDefaultOrganizationId } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const { organizationId } = session;

    const searchParams = req.nextUrl.searchParams;
    const range = parseInt(searchParams.get('range') || '30');
    const format = searchParams.get('format') || 'csv';
    const type = searchParams.get('type') || 'executive'; // executive, customers, marketing, banners

    const now = new Date();
    const startDate = startOfDay(subDays(now, range));
    const prevStart = startOfDay(subDays(now, range * 2));
    const prevEnd = startOfDay(subDays(now, range));

    let csv: string;

    switch (type) {
      case 'executive':
        const executiveMetrics = await getExecutiveMetrics({
          organizationId,
          startDate,
          endDate: now,
          previousStartDate: prevStart,
          previousEndDate: prevEnd,
        });
        const inventoryMetrics = await getInventoryMetrics(organizationId);
        csv = generateExecutiveCSV(executiveMetrics, inventoryMetrics, range);
        break;

      case 'customers':
        csv = await generateCustomerCSV(organizationId, startDate);
        break;

      case 'marketing':
        csv = await generateMarketingCSV(organizationId, startDate);
        break;

      case 'banners':
        csv = await generateBannerCSV(organizationId, startDate);
        break;

      default:
        const execMetrics = await getExecutiveMetrics({
          organizationId,
          startDate,
          endDate: now,
          previousStartDate: prevStart,
          previousEndDate: prevEnd,
        });
        const invMetrics = await getInventoryMetrics(organizationId);
        csv = generateExecutiveCSV(execMetrics, invMetrics, range);
    }

    if (format === 'csv') {
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${type}-export-${now.toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  } catch (error) {
    console.error('[ANALYTICS_EXPORT] Error:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function generateExecutiveCSV(metrics: any, inventory: any, range: number): string {
  const headers = [
    'Metric',
    'Value',
    'Change (%)',
    'Period',
  ];

  const rows = [
    ['Revenue', metrics.revenue.total.toFixed(2), metrics.revenue.change.toFixed(2), `Last ${range} days`],
    ['Orders', metrics.orders.total, metrics.orders.change.toFixed(2), `Last ${range} days`],
    ['Average Order Value', metrics.orders.averageOrderValue.toFixed(2), metrics.orders.aovChange.toFixed(2), `Last ${range} days`],
    ['Total Customers', metrics.customers.total, '', 'All time'],
    ['New Customers', metrics.customers.new, '', `Last ${range} days`],
    ['Active Customers', metrics.customers.active, '', 'Last 30 days'],
    ['Customer Lifetime Value', metrics.customers.lifetimeValue.toFixed(2), '', 'All time'],
    ['Repeat Purchase Rate', metrics.customers.repeatPurchaseRate.toFixed(2) + '%', '', 'All time'],
    ['Profit', metrics.profit.total.toFixed(2), metrics.profit.change.toFixed(2), `Last ${range} days`],
    ['Profit Margin', metrics.profit.margin.toFixed(2) + '%', '', `Last ${range} days`],
    ['Inventory Total Value', inventory.totalValue.toFixed(2), '', 'Current'],
    ['Out of Stock Products', inventory.outOfStock, '', 'Current'],
    ['Low Stock Products', inventory.lowStock, '', 'Current'],
    ['Overstocked Products', inventory.overstocked, '', 'Current'],
    ['Conversion Rate', metrics.conversion.rate.toFixed(2) + '%', '', 'Today'],
    ['Cart Abandonment Rate', metrics.conversion.cartAbandonmentRate.toFixed(2) + '%', '', 'Today'],
  ];

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  return csvContent;
}

async function generateCustomerCSV(organizationId: string, startDate: Date): Promise<string> {
  const customers = await prisma.user.findMany({
    where: {
      organizationId,
      role: 'USER',
    },
    include: {
      orders: {
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startDate },
        },
      },
    },
  });

  const headers = ['Customer ID', 'Name', 'Email', 'Total Spent', 'Order Count', 'Created At'];

  const rows = customers.map(customer => {
    const totalSpent = customer.orders.reduce((sum: number, order: any) => sum + order.total, 0);
    return [
      customer.id,
      customer.name || '',
      customer.email || '',
      totalSpent.toFixed(2),
      customer.orders.length,
      customer.createdAt.toISOString(),
    ];
  });

  return [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');
}

async function generateMarketingCSV(organizationId: string, startDate: Date): Promise<string> {
  const events = await prisma.analyticsEvent.findMany({
    where: {
      organizationId,
      occurredAt: { gte: startDate },
    },
  });

  const attributionByChannel = events.reduce((acc: any, event: any) => {
    const utmSource = event.properties?.utmSource || 'direct';
    const utmMedium = event.properties?.utmMedium || 'none';
    const channel = `${utmSource}/${utmMedium}`;

    if (!acc[channel]) {
      acc[channel] = { channel, impressions: 0, clicks: 0, conversions: 0 };
    }

    if (event.eventType === 'PAGE_VIEW') {
      acc[channel].impressions++;
    } else if (event.eventType === 'PRODUCT_VIEW') {
      acc[channel].clicks++;
    } else if (event.eventType === 'ADD_TO_CART' || event.eventType === 'CHECKOUT_STARTED') {
      acc[channel].conversions++;
    }

    return acc;
  }, {});

  const headers = ['Channel', 'Impressions', 'Clicks', 'Conversions', 'CTR (%)', 'Conversion Rate (%)'];

  const rows = Object.values(attributionByChannel).map((item: any) => [
    item.channel,
    item.impressions,
    item.clicks,
    item.conversions,
    item.impressions > 0 ? ((item.clicks / item.impressions) * 100).toFixed(2) : '0',
    item.clicks > 0 ? ((item.conversions / item.clicks) * 100).toFixed(2) : '0',
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');
}

async function generateBannerCSV(organizationId: string, startDate: Date): Promise<string> {
  const banners = await prisma.heroBanner.findMany({
    where: { organizationId },
    include: {
      analytics: {
        where: { createdAt: { gte: startDate } },
      },
    },
  });

  const headers = ['Banner ID', 'Title', 'Impressions', 'Primary Clicks', 'Secondary Clicks', 'Total Clicks', 'CTR (%)', 'Status'];

  const rows = banners.map(banner => {
    const impressions = banner.analytics.filter((a: any) => a.eventType === 'impression').length;
    const primaryClicks = banner.analytics.filter((a: any) => a.eventType === 'primaryClick').length;
    const secondaryClicks = banner.analytics.filter((a: any) => a.eventType === 'secondaryClick').length;
    const totalClicks = primaryClicks + secondaryClicks;
    const ctr = impressions > 0 ? (totalClicks / impressions) * 100 : 0;

    return [
      banner.id,
      banner.title,
      impressions,
      primaryClicks,
      secondaryClicks,
      totalClicks,
      ctr.toFixed(2),
      banner.isActive ? 'Active' : 'Inactive',
    ];
  });

  return [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');
}


// src/app/api/admin/analytics/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-api';
import { getExecutiveMetrics, getInventoryMetrics } from '@/lib/services/executive-analytics.service';
import { subDays, startOfDay } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const { organizationId } = session;

    const searchParams = req.nextUrl.searchParams;
    const range = parseInt(searchParams.get('range') || '30');
    const format = searchParams.get('format') || 'csv';

    const now = new Date();
    const startDate = startOfDay(subDays(now, range));
    const prevStart = startOfDay(subDays(now, range * 2));
    const prevEnd = startOfDay(subDays(now, range));

    // Get metrics
    const executiveMetrics = await getExecutiveMetrics({
      organizationId,
      startDate,
      endDate: now,
      previousStartDate: prevStart,
      previousEndDate: prevEnd,
    });

    const inventoryMetrics = await getInventoryMetrics(organizationId);

    // Generate CSV
    if (format === 'csv') {
      const csv = generateCSV(executiveMetrics, inventoryMetrics, range);
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics-export-${now.toISOString().split('T')[0]}.csv"`,
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

function generateCSV(metrics: any, inventory: any, range: number): string {
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

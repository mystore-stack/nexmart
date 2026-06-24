import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { subDays, startOfDay } from "date-fns";

// GET customer insights analytics
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const range = parseInt(req.nextUrl.searchParams.get("range") || "30");
    const now = new Date();
    const startDate = startOfDay(subDays(now, range));

    // Get all customers
    const customers = await prisma.user.findMany({
      where: {
        role: "USER",
      },
      include: {
        orders: {
          where: {
            paymentStatus: "PAID",
            createdAt: { gte: startDate },
          },
        },
      },
    });

    // Calculate customer metrics
    const totalCustomers = customers.length;
    const newCustomers = customers.filter((c) => c.createdAt >= startDate).length;
    const returningCustomers = customers.filter((c) => c.orders.length > 1).length;

    // Calculate lifetime value
    const customerLTV = customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      totalSpent: c.orders.reduce((sum, order) => sum + order.total, 0),
      orderCount: c.orders.length,
      createdAt: c.createdAt,
    }));

    const totalRevenue = customerLTV.reduce((sum, c) => sum + c.totalSpent, 0);
    const averageLTV = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
    const repeatPurchaseRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;

    // Calculate churn rate (customers who haven't purchased in the last 30 days)
    const churnThreshold = subDays(now, 30);
    const activeCustomers = customers.filter((c) => {
      const lastOrder = c.orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      return lastOrder && lastOrder.createdAt >= churnThreshold;
    }).length;
    const churnRate = totalCustomers > 0 ? ((totalCustomers - activeCustomers) / totalCustomers) * 100 : 0;

    // Segment customers
    const vipCustomers = customerLTV.filter((c) => c.totalSpent > 5000).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10);
    const highValueCustomers = customerLTV.filter((c) => c.totalSpent > 1000 && c.totalSpent <= 5000).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10);
    const atRiskCustomers = customerLTV.filter((c) => {
      const lastOrder = customers.find((cust) => cust.id === c.id)?.orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      return c.totalSpent > 500 && (!lastOrder || lastOrder.createdAt < churnThreshold);
    }).slice(0, 10);

    // Get customer acquisition over time
    const customerAcquisition = await prisma.user.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      where: {
        role: "USER",
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by date for chart
    const acquisitionData = customerAcquisition.reduce((acc: any, item) => {
      const date = new Date(item.createdAt).toISOString().split("T")[0];
      if (!acc[date]) {
        acc[date] = { date, count: 0 };
      }
      acc[date].count += item._count.id;
      return acc;
    }, {});

    const chartData = Object.values(acquisitionData);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalCustomers,
          newCustomers,
          returningCustomers,
          averageLTV: parseFloat(averageLTV.toFixed(2)),
          repeatPurchaseRate: parseFloat(repeatPurchaseRate.toFixed(2)),
          churnRate: parseFloat(churnRate.toFixed(2)),
        },
        segments: {
          vipCustomers,
          highValueCustomers,
          atRiskCustomers,
        },
        chartData,
        topCustomers: customerLTV.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 20),
      },
    });
  } catch (error: any) {
    console.error("[CUSTOMER ANALYTICS ERROR]", error);
    if (error.statusCode) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch customer analytics" },
      { status: 500 }
    );
  }
}

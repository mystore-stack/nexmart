// src/app/api/admin/orders/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { ok, forbidden, handleApiError, getPaginationParams, buildPaginationMeta } from "@/lib/api";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { validateEnum } from "@/lib/validate-enum";

export const dynamic = "force-dynamic";

function generateCSV(orders: any[]) {
  const headers = ["Order Number", "Customer Name", "Customer Email", "Status", "Total", "Created At", "Tracking Number"];
  const rows = orders.map(order => [
    order.orderNumber,
    order.user.name,
    order.user.email,
    order.status,
    order.total,
    order.createdAt,
    order.trackingNumber || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
  ].join("\n");

  return csvContent;
}

export async function GET(req: NextRequest) {
  try {
    console.log("PaymentStatus enum mismatch debug - Starting GET request");
    
    const session = await requireAdmin();
    
    // Defensive check for organizationId
    if (!session.organizationId) {
      console.error("[ADMIN ORDERS] Session exists but organizationId is missing");
      return forbidden("Organization access required. Please contact support to assign you to an organization.");
    }
    
    const organizationId = session.organizationId;

    const exportFormat = req.nextUrl.searchParams.get("export");
    const { page, limit, skip } = getPaginationParams(req.nextUrl.searchParams);
    const status = validateEnum(req.nextUrl.searchParams.get("status"), Object.values(OrderStatus));
    const search = req.nextUrl.searchParams.get("search") || undefined;
    const dateFrom = req.nextUrl.searchParams.get("from");
    const dateTo = req.nextUrl.searchParams.get("to");

    const where: any = {
      organizationId,
      ...(status && { status }),
      ...(search && {
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" } },
          { user: { email: { contains: search, mode: "insensitive" } } },
          { user: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
      ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
      ...(dateTo && { createdAt: { lte: new Date(dateTo) } }),
    };

    console.log("[ADMIN ORDERS] QUERY");
    console.log("[ADMIN ORDERS] userId:", session.userId);
    console.log("[ADMIN ORDERS] organizationId:", organizationId);
    console.log("[ADMIN ORDERS] where:", where);

    // DEBUG: Check total orders in database (regardless of organization)
    const totalOrdersInDb = await prisma.order.count();
    console.log("[ADMIN ORDERS DEBUG] Total orders in database:", totalOrdersInDb);

    // DEBUG: Check all organizations in database
    const allOrgs = await prisma.organization.findMany({
      select: { id: true, name: true, slug: true },
    });
    console.log("[ADMIN ORDERS DEBUG] Organizations in database:", allOrgs.map(o => ({ id: o.id, name: o.name, slug: o.slug })));

    // DEBUG: Check orders for this specific organizationId
    const ordersForOrg = await prisma.order.count({ where: { organizationId } });
    console.log("[ADMIN ORDERS DEBUG] Orders for organizationId:", organizationId, "=", ordersForOrg);

    // DEBUG: Check if organizationId exists in database
    const orgExists = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { id: true, name: true },
    });
    console.log("[ADMIN ORDERS DEBUG] Organization exists:", !!orgExists, orgExists ? { id: orgExists.id, name: orgExists.name } : null);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
          items: { include: { product: { select: { name: true, images: true } } } },
          address: true,
          coupon: { select: { code: true } },
          trackingHistory: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        skip: exportFormat ? undefined : skip,
        take: exportFormat ? undefined : limit,
      }),
      prisma.order.count({ where }),
    ]);

    console.log("[ADMIN ORDERS] Orders found:", orders.length, "Total:", total);

    // Export to CSV
    if (exportFormat === "csv") {
      const csv = generateCSV(orders);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // CRITICAL FIX: Log warning if no orders found but organizationId is set
    if (orders.length === 0 && total === 0) {
      console.warn("[ADMIN ORDERS] WARNING: No orders found for organizationId:", organizationId);
      console.warn("[ADMIN ORDERS] This may indicate:");
      console.warn("[ADMIN ORDERS] 1. The organizationId is incorrect (user may be using default fallback)");
      console.warn("[ADMIN ORDERS] 2. No orders exist in this organization");
      console.warn("[ADMIN ORDERS] 3. The user may need a Membership or Organization ownership record");
    }

    const responseData = { data: orders, pagination: buildPaginationMeta(total, page, limit) };

    console.log("[ADMIN ORDERS] RESPONSE PAYLOAD:", JSON.stringify(responseData, null, 2));

    return ok(responseData);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    
    // Defensive check for organizationId
    if (!session.organizationId) {
      console.error("[ADMIN ORDERS POST] Session exists but organizationId is missing");
      return forbidden("Organization access required. Please contact support to assign you to an organization.");
    }
    
    const organizationId = session.organizationId;

    const body = await req.json();
    const action = body.action;

    if (action === "statistics") {
      const stats = await prisma.order.groupBy({
        by: ["status"],
        where: { organizationId },
        _count: true,
        _sum: { total: true },
      });

      const totalRevenue = await prisma.order.aggregate({
        where: { 
          organizationId, 
          status: { in: [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED] } 
        },
        _sum: { total: true },
      });

      const totalOrders = await prisma.order.count({ where: { organizationId } });

      const recentOrders = await prisma.order.findMany({
        where: { organizationId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
        },
      });

      return ok({
        byStatus: stats,
        totalRevenue: totalRevenue._sum.total || 0,
        totalOrders,
        recentOrders,
      });
    }

    if (action === "bulkUpdate") {
      const { orderIds, updates } = body;

      const result = await prisma.order.updateMany({
        where: {
          id: { in: orderIds },
          organizationId,
        },
        data: updates,
      });

      return ok({ message: `Updated ${result.count} orders`, count: result.count });
    }

    return ok({ message: "Invalid action" });
  } catch (err) {
    return handleApiError(err);
  }
}

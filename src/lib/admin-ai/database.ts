import { prisma } from "@/lib/prisma";
import type { DatabaseTableSnapshot } from "./types";

export async function getDatabaseSnapshot(
  organizationId: string,
  table: DatabaseTableSnapshot["table"] = "users",
  take = 25,
): Promise<DatabaseTableSnapshot> {
  const limit = Math.min(Math.max(take, 1), 100);

  if (table === "users") {
    const [count, rows] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: { id: true, email: true, name: true, role: true, emailVerified: true, createdAt: true },
      }),
    ]);
    return { table, count, rows };
  }

  if (table === "products") {
    const [count, rows] = await Promise.all([
      prisma.product.count({ where: { organizationId } }),
      prisma.product.findMany({
        where: { organizationId },
        orderBy: { updatedAt: "desc" },
        take: limit,
        select: { id: true, name: true, sku: true, price: true, stock: true, published: true, updatedAt: true },
      }),
    ]);
    return { table, count, rows };
  }

  if (table === "orders") {
    const [count, rows] = await Promise.all([
      prisma.order.count({ where: { organizationId } }),
      prisma.order.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: { id: true, orderNumber: true, status: true, paymentStatus: true, total: true, createdAt: true },
      }),
    ]);
    return { table, count, rows };
  }

  if (table === "categories") {
    const [count, rows] = await Promise.all([
      prisma.category.count({ where: { organizationId } }),
      prisma.category.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: { id: true, name: true, slug: true, parentId: true, createdAt: true, _count: { select: { products: true } } },
      }),
    ]);
    return { table, count, rows };
  }

  const row = await prisma.siteSettings.findUnique({
    where: { organizationId },
    select: {
      id: true,
      storeName: true,
      siteUrl: true,
      email: true,
      supportEmail: true,
      locale: true,
      currency: true,
      updatedAt: true,
    },
  });
  return { table, count: row ? 1 : 0, rows: row ? [row] : [] };
}

export async function getDatabaseOverview(organizationId: string) {
  const [users, products, orders, categories, settings] = await Promise.all([
    prisma.user.count(),
    prisma.product.count({ where: { organizationId } }),
    prisma.order.count({ where: { organizationId } }),
    prisma.category.count({ where: { organizationId } }),
    prisma.siteSettings.count({ where: { organizationId } }),
  ]);

  return { users, products, orders, categories, settings };
}

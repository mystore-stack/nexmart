import { prisma } from "@/lib/prisma";

/**
 * Decrement stock when Redis/BullMQ worker is unavailable (Vercel, local dev).
 */
export async function decrementOrderInventory(
  orderId: string,
  organizationId: string
): Promise<void> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, organizationId },
    include: { items: true },
  });
  if (!order) return;

  await prisma.$transaction(
    order.items.map((item) =>
      prisma.product.update({
        where: { id: item.productId, organizationId },
        data: {
          stock: { decrement: item.quantity },
          soldCount: { increment: item.quantity },
        },
      })
    )
  );
}

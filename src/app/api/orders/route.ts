import { notifyNewOrder } from "@/lib/notifications/telegram";
// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getOrganizationIdForUser } from "@/lib/tenant";
import { generateOrderNumber } from "@/utils/format";
import { getValidatedShippingCost } from "@/lib/shipping";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

const DEFAULT_CARRIER = "jibli";
const DEFAULT_CITY = "Casablanca";

const createOrderSchema = z.object({
  addressId: z.string(),
  paymentMethod: z.enum(["STRIPE", "CASH_ON_DELIVERY"]),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      quantity: z.number().min(1).max(99),
    })
  ),
  couponCode: z.string().optional(),
  /** @deprecated Use city + shippingCarrierId — still accepted for backward compatibility */
  city: z.string().min(2).optional(),
  shippingCarrierId: z.string().min(1).optional(),
  shippingCost: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});

type Tx = Prisma.TransactionClient;

function calculateCouponDiscount(
  coupon: { type: string; value: number; maxDiscount: number | null } | null,
  subtotal: number
) {
  if (!coupon) return 0;
  const rawDiscount =
    coupon.type === "PERCENTAGE" ? subtotal * (coupon.value / 100) : coupon.value;
  const cappedDiscount = coupon.maxDiscount
    ? Math.min(rawDiscount, coupon.maxDiscount)
    : rawDiscount;
  return Math.max(0, Math.min(subtotal, cappedDiscount));
}

async function resolveCoupon(
  tx: Tx,
  organizationId: string,
  userId: string,
  couponCode: string | undefined,
  subtotal: number
) {
  if (!couponCode) return null;

  const coupon = await tx.coupon.findFirst({
    where: {
      organizationId,
      code: couponCode.toUpperCase(),
      active: true,
      startDate: { lte: new Date() },
      OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
    },
  });

  if (!coupon) throw new Error("Coupon invalide ou expiré");
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("Coupon épuisé");
  }
  if (coupon.minOrder && subtotal < coupon.minOrder) {
    throw new Error(`Commande minimum de ${coupon.minOrder.toFixed(2)} MAD requise`);
  }
  if (coupon.userLimit) {
    const usage = await tx.order.count({
      where: { organizationId, userId, couponId: coupon.id },
    });
    if (usage >= coupon.userLimit) throw new Error("Coupon déjà utilisé");
  }

  return coupon;
}

async function resolveShippingContext(
  userId: string,
  addressId: string,
  body: z.infer<typeof createOrderSchema>
) {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
    select: { city: true },
  });

  const city = body.city ?? address?.city ?? DEFAULT_CITY;
  const shippingCarrierId = body.shippingCarrierId ?? DEFAULT_CARRIER;
  return { city, shippingCarrierId };
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const organizationId = await getOrganizationIdForUser(user);
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 10;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: user.userId, organizationId },
        include: { items: { include: { product: true, variant: true } }, address: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where: { userId: user.userId, organizationId } }),
    ]);

    return NextResponse.json({ success: true, orders, pagination: { page, limit, total } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await requireAuth();
    const organizationId = await getOrganizationIdForUser(authUser);
    const body = createOrderSchema.parse(await req.json());

    const address = await prisma.address.findFirst({
      where: { id: body.addressId, userId: authUser.userId },
    });
    if (!address) {
      return NextResponse.json({ success: false, error: "Adresse invalide" }, { status: 400 });
    }

    const { city, shippingCarrierId } = await resolveShippingContext(
      authUser.userId,
      body.addressId,
      body
    );

    const order = await prisma.$transaction(async (tx) => {
      const productIds = body.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, organizationId, published: true },
        include: { variants: true },
      });

      let subtotal = 0;
      const orderItems = body.items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) throw new Error(`Produit ${item.productId} introuvable`);

        const variant = item.variantId
          ? product.variants.find((v) => v.id === item.variantId)
          : null;
        if (item.variantId && !variant) {
          throw new Error(`Variante invalide pour ${product.name}`);
        }

        const availableStock = variant?.stock ?? product.stock;
        if (availableStock < item.quantity) {
          throw new Error(`Stock insuffisant pour ${product.name}`);
        }

        const price = variant?.price ?? product.price;
        subtotal += price * item.quantity;
        return {
          productId: item.productId,
          variantId: item.variantId,
          name: product.name,
          image: product.images[0] ?? "",
          price,
          quantity: item.quantity,
        };
      });

      for (const item of body.items) {
        const productUpdate = await tx.product.updateMany({
          where: {
            id: item.productId,
            organizationId,
            published: true,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });
        if (productUpdate.count !== 1) throw new Error("Stock insuffisant");

        if (item.variantId) {
          const variantUpdate = await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              productId: item.productId,
              stock: { gte: item.quantity },
            },
            data: { stock: { decrement: item.quantity } },
          });
          if (variantUpdate.count !== 1) throw new Error("Stock variante insuffisant");
        }
      }

      const coupon = await resolveCoupon(
        tx,
        organizationId,
        authUser.userId,
        body.couponCode,
        subtotal
      );
      const discount = calculateCouponDiscount(coupon, subtotal);
      const shipping = getValidatedShippingCost(
        city,
        subtotal - discount,
        shippingCarrierId,
        body.shippingCost
      );
      const total = subtotal - discount + shipping;

      const createdOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          organizationId,
          userId: authUser.userId,
          addressId: body.addressId,
          paymentMethod: body.paymentMethod,
          subtotal,
          discount,
          shipping,
          total,
          couponId: coupon?.id,
          notes: body.notes,
          items: { create: orderItems },
        },
        include: { items: true, address: true },
      });

      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.cartItem.deleteMany({ where: { userId: authUser.userId } });
      return createdOrder;
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    const status =
      message === "Unauthorized"
        ? 401
        : message.includes("invalide") ||
            message.includes("Stock") ||
            message.includes("stock") ||
            message.includes("introuvable") ||
            message.includes("Coupon") ||
            message.includes("minimum")
          ? 400
          : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

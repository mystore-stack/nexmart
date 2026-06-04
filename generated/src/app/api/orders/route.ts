// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { generateOrderNumber } from "@/utils/format";
import { z } from "zod";

const createOrderSchema = z.object({
  addressId:     z.string(),
  paymentMethod: z.enum(["STRIPE", "CASH_ON_DELIVERY"]),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity:  z.number().min(1),
  })),
  couponCode:    z.string().optional(),
  shippingCost:  z.number().default(35),
  notes:         z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user   = await requireAuth();
    const { searchParams } = new URL(req.url);
    const page   = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit  = 10;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where:   { userId: user.userId },
        include: { items: { include: { product: true, variant: true } }, address: true },
        orderBy: { createdAt: "desc" },
        skip:    (page - 1) * limit,
        take:    limit,
      }),
      prisma.order.count({ where: { userId: user.userId } }),
    ]);

    return NextResponse.json({ success: true, orders, pagination: { page, limit, total } });
  } catch (err: any) {
    const status = err.message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, error: err.message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await requireAuth();
    const body     = createOrderSchema.parse(await req.json());

    // Fetch products + calculate totals
    const productIds = body.items.map((i) => i.productId);
    const products   = await prisma.product.findMany({ where: { id: { in: productIds } }, include: { variants: true } });

    let subtotal = 0;
      type ProductWithVariants = typeof products[number];

      const orderItems = body.items.map((item: (typeof body.items)[number]) => {
        const product = products.find((p: ProductWithVariants) => p.id === item.productId);
        if (!product) throw new Error(`Produit ${item.productId} introuvable`);

        const variant = product.variants.find((v: any) => v.id === item.variantId);
        const price = (variant?.price as number | undefined) ?? (product.price as number);

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


    const shipping = body.shippingCost;
    const total    = subtotal + shipping;

    const order = await prisma.order.create({
      data: {
        orderNumber:   generateOrderNumber(),
        userId:        authUser.userId,
        addressId:     body.addressId,
        paymentMethod: body.paymentMethod,
        subtotal,
        shipping,
        total,
        notes:         body.notes,
        items:         { create: orderItems },
      },
      include: { items: true, address: true },
    });

    // Clear cart
    await prisma.cartItem.deleteMany({ where: { userId: authUser.userId } });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

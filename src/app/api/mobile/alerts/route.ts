import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getMobileSession } from "@/lib/mobile-auth-api";
import { requireAuth } from "@/lib/auth-api";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = (await getMobileSession(req)) || (await requireAuth().catch(() => null));
    if (!session) {
      return NextResponse.json({ success: false, message: "Authentification requise" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, type } = body; // type: "PRICE_DROP" | "BACK_IN_STOCK"

    if (!productId || !type) {
      return NextResponse.json({ success: false, message: "productId et type requis" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, price: true, slug: true },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Produit non trouvé" }, { status: 404 });
    }

    const title = type === "PRICE_DROP"
      ? `Alerte Baisse de Prix activée : ${product.name}`
      : `Alerte Retour en Stock activée : ${product.name}`;

    const messageBody = type === "PRICE_DROP"
      ? `Vous serez notifié dès que le prix de ${product.name} passera sous ${product.price} MAD.`
      : `Vous serez notifié dès le retour en stock de ${product.name}.`;

    // Create confirmation in-app notification
    const notification = await prisma.notification.create({
      data: {
        userId: session.userId,
        type: type === "PRICE_DROP" ? "PRICE_DROP" : "BACK_IN_STOCK",
        title,
        body: messageBody,
        link: `/products/${product.slug}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Alerte activée avec succès",
      notification,
    });
  } catch (err: any) {
    console.error("[api/mobile/alerts] Error:", err);
    return NextResponse.json({ success: false, message: "Erreur serveur" }, { status: 500 });
  }
}

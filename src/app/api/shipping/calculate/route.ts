// src/app/api/shipping/calculate/route.ts — Moroccan delivery pricing
import { NextRequest, NextResponse } from "next/server";
import { calculateShippingOptions, getShippingZone } from "@/lib/shipping";
import { z } from "zod";

const schema = z.object({
  city: z.string().min(2).max(80),
  subtotal: z.number().min(0),
});

export async function POST(req: NextRequest) {
  try {
    const { city, subtotal } = schema.parse(await req.json());
    const options = calculateShippingOptions(city, subtotal);
    const zone = getShippingZone(city);

    return NextResponse.json({ success: true, options, zone });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json({ success: false, error: "Données invalides" }, { status: 422 });
    }
    return NextResponse.json({ success: false, error: "Erreur calcul livraison" }, { status: 500 });
  }
}

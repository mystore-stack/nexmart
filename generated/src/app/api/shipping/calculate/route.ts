// src/app/api/shipping/calculate/route.ts — Moroccan delivery pricing
import { NextRequest, NextResponse } from "next/server";

const MOROCCAN_CITIES: Record<string, { zone: 1 | 2 | 3 }> = {
  casablanca: { zone: 1 }, rabat: { zone: 1 }, salé: { zone: 1 },
  marrakech: { zone: 2 }, fès: { zone: 2 }, meknès: { zone: 2 },
  tanger: { zone: 2 }, agadir: { zone: 2 }, oujda: { zone: 2 },
  laayoune: { zone: 3 }, dakhla: { zone: 3 }, "al hoceima": { zone: 3 },
};

const CARRIERS = {
  amana: {
    name: "Amana",
    logo: "https://nexmart.ma/carriers/amana.png",
    prices: { 1: 30, 2: 40, 3: 55 },
    days:   { 1: "1-2 jours", 2: "2-3 jours", 3: "3-5 jours" },
  },
  chrono_diali: {
    name: "Chrono Diali",
    logo: "https://nexmart.ma/carriers/chronodiali.png",
    prices: { 1: 50, 2: 60, 3: 80 },
    days:   { 1: "24h", 2: "24-48h", 3: "2-3 jours" },
  },
  jibli: {
    name: "Jibli",
    logo: "https://nexmart.ma/carriers/jibli.png",
    prices: { 1: 20, 2: 30, 3: 45 },
    days:   { 1: "2-3 jours", 2: "3-4 jours", 3: "4-6 jours" },
  },
};

export async function POST(req: NextRequest) {
  try {
    const { city, subtotal } = await req.json();
    const cityKey  = city?.toLowerCase().trim();
    const cityData = MOROCCAN_CITIES[cityKey] ?? { zone: 2 as const };
    const zone     = cityData.zone;
    const freeShippingThreshold = 500;

    const options = Object.entries(CARRIERS).map(([id, carrier]) => ({
      id,
      name:     carrier.name,
      logo:     carrier.logo,
      price:    subtotal >= freeShippingThreshold ? 0 : carrier.prices[zone],
      days:     carrier.days[zone],
      free:     subtotal >= freeShippingThreshold,
    }));

    return NextResponse.json({ success: true, options, zone });
  } catch {
    return NextResponse.json({ success: false, error: "Erreur calcul livraison" }, { status: 500 });
  }
}

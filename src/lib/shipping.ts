// Shared Moroccan shipping pricing (server-side source of truth)

const MOROCCAN_CITIES: Record<string, { zone: 1 | 2 | 3 }> = {
  casablanca: { zone: 1 },
  rabat: { zone: 1 },
  salé: { zone: 1 },
  sale: { zone: 1 },
  marrakech: { zone: 2 },
  fès: { zone: 2 },
  fes: { zone: 2 },
  meknès: { zone: 2 },
  meknes: { zone: 2 },
  tanger: { zone: 2 },
  agadir: { zone: 2 },
  oujda: { zone: 2 },
  laayoune: { zone: 3 },
  dakhla: { zone: 3 },
  "al hoceima": { zone: 3 },
};

export const CARRIERS = {
  amana: {
    name: "Amana",
    logo: "https://nexmart.ma/carriers/amana.png",
    prices: { 1: 30, 2: 40, 3: 55 },
    days: { 1: "1-2 jours", 2: "2-3 jours", 3: "3-5 jours" },
  },
  chrono_diali: {
    name: "Chrono Diali",
    logo: "https://nexmart.ma/carriers/chronodiali.png",
    prices: { 1: 50, 2: 60, 3: 80 },
    days: { 1: "24h", 2: "24-48h", 3: "2-3 jours" },
  },
  jibli: {
    name: "Jibli",
    logo: "https://nexmart.ma/carriers/jibli.png",
    prices: { 1: 20, 2: 30, 3: 45 },
    days: { 1: "2-3 jours", 2: "3-4 jours", 3: "4-6 jours" },
  },
} as const;

export type CarrierId = keyof typeof CARRIERS;

const FREE_SHIPPING_THRESHOLD = 500;

export function getShippingZone(city: string): 1 | 2 | 3 {
  const cityKey = city?.toLowerCase().trim();
  return MOROCCAN_CITIES[cityKey]?.zone ?? 2;
}

export function calculateShippingOptions(city: string, subtotal: number) {
  const zone = getShippingZone(city);
  const free = subtotal >= FREE_SHIPPING_THRESHOLD;

  return Object.entries(CARRIERS).map(([id, carrier]) => ({
    id: id as CarrierId,
    name: carrier.name,
    logo: carrier.logo,
    price: free ? 0 : carrier.prices[zone],
    days: carrier.days[zone],
    free,
  }));
}

export function getValidatedShippingCost(
  city: string,
  subtotal: number,
  carrierId: string,
  claimedCost?: number
): number {
  const options = calculateShippingOptions(city, subtotal);
  const selected = options.find((o) => o.id === carrierId);
  if (!selected) {
    throw new Error("Transporteur invalide");
  }
  if (claimedCost !== undefined && Math.abs(selected.price - claimedCost) > 0.01) {
    throw new Error("Frais de livraison invalides");
  }
  return selected.price;
}

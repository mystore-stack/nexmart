// src/app/m/deals/page.tsx — Super Deals (Real Data)
import type { Metadata } from "next";
import { getMobileDeals } from "@/lib/mobile-data";
import { DealsPageClient } from "./DealsPageClient";

export const metadata: Metadata = { title: "Super Deals" };
export const revalidate = 300;

export default async function DealsPage() {
  const deals = await getMobileDeals();

  return <DealsPageClient deals={deals} />;
}

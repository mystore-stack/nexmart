// src/app/m/deals/page.tsx — Super Deals (Real Data)
import type { Metadata } from "next";
import { getMobileDeals } from "@/lib/mobile-data";
import { DealsPageClientNew } from "./DealsPageClientNew";

export const metadata: Metadata = { title: "Super Deals" };
export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const deals = await getMobileDeals();

  return <DealsPageClientNew deals={deals} />;
}

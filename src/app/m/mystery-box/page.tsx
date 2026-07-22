// src/app/m/mystery-box/page.tsx — MyStoreBox (Real Data)
import type { Metadata } from "next";
import { getMobileMysteryBoxes } from "@/lib/mobile-data";
import { MysteryBoxPageClient } from "./MysteryBoxPageClient";

export const metadata: Metadata = { title: "Mystery Box" };
export const revalidate = 3600;

export default async function MysteryBoxPage() {
  const boxes = await getMobileMysteryBoxes();

  return <MysteryBoxPageClient boxes={boxes} />;
}

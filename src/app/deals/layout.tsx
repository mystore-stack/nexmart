import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ventes Flash | NexMart Maroc",
  description: "Profitez de nos ventes flash exclusives avec des réductions allant jusqu'à -50%. High-Tech, Mode, Luxe - stocks limités!",
  keywords: "ventes flash, deals, promotions, réductions, NexMart Maroc, shopping",
};

export default function DealsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

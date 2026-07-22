// src/app/m/cart/page.tsx — Cart (RSC shell)
import type { Metadata } from "next";
import { CartPageClient } from "./CartPageClient";

export const metadata: Metadata = { title: "Cart" };

export default function CartPage() {
  return <CartPageClient />;
}

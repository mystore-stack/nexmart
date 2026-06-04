import type { Metadata } from "next";
import { StaticPage } from "@/components/content/StaticPage";
import Link from "next/link";

export const metadata: Metadata = { title: "Carrières | NexMart MA" };

export default function CareersPage() {
  return (
    <StaticPage title="Carrières">
      <p>NexMart grandit au Maroc. Nous recrutons des profils tech, logistique et support client.</p>
      <p>Envoyez votre CV à <a href="mailto:careers@nexmart.ma" className="text-brand-600 hover:underline">careers@nexmart.ma</a>.</p>
      <Link href="/contact" className="text-brand-600 hover:underline text-sm">Contact recrutement →</Link>
    </StaticPage>
  );
}

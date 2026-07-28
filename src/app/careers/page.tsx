import type { Metadata } from "next";
import { StaticPage } from "@/components/content/StaticPage";
import Link from "next/link";

export const metadata: Metadata = { title: "CarriÃ¨res | NexStore MA" };

export default function CareersPage() {
  return (
    <StaticPage title="CarriÃ¨res">
      <p>NexStore grandit au Maroc. Nous recrutons des profils tech, logistique et support client.</p>
      <p>Envoyez votre CV Ã  <a href="mailto:careers@nexstore.ma" className="text-brand-600 hover:underline">careers@nexstore.ma</a>.</p>
      <Link href="/contact" className="text-brand-600 hover:underline text-sm">Contact recrutement â†’</Link>
    </StaticPage>
  );
}


import type { Metadata } from "next";
import { StaticPage } from "@/components/content/StaticPage";

export const metadata: Metadata = { title: "Presse | NexMart MA" };

export default function PressPage() {
  return (
    <StaticPage title="Presse">
      <p>Demandes presse : press@nexmart.ma</p>
      <p>Kit média et communiqués disponibles sur demande.</p>
    </StaticPage>
  );
}

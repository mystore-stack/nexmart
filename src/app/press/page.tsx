import type { Metadata } from "next";
import { StaticPage } from "@/components/content/StaticPage";

export const metadata: Metadata = { title: "Presse | NexStore MA" };

export default function PressPage() {
  return (
    <StaticPage title="Presse">
      <p>Demandes presse : press@nexstore.ma</p>
      <p>Kit mÃ©dia et communiquÃ©s disponibles sur demande.</p>
    </StaticPage>
  );
}


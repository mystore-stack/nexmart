import type { Metadata } from "next";
import { StaticPage } from "@/components/content/StaticPage";

export const metadata: Metadata = { title: "Affiliation | NexStore MA" };

export default function AffiliatesPage() {
  return (
    <StaticPage title="Programme d'affiliation">
      <p>Gagnez une commission en recommandant NexStore Ã  votre audience.</p>
      <p>Contact : affiliates@nexstore.ma pour rejoindre le programme.</p>
    </StaticPage>
  );
}


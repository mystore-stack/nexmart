import type { Metadata } from "next";
import { StaticPage } from "@/components/content/StaticPage";

export const metadata: Metadata = { title: "Affiliation | NexMart MA" };

export default function AffiliatesPage() {
  return (
    <StaticPage title="Programme d'affiliation">
      <p>Gagnez une commission en recommandant NexMart à votre audience.</p>
      <p>Contact : affiliates@nexmart.ma pour rejoindre le programme.</p>
    </StaticPage>
  );
}

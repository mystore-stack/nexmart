import type { Metadata } from "next";
import { StaticPage } from "@/components/content/StaticPage";

export const metadata: Metadata = { title: "Offres Flash | NexMart MA" };

export default function DealsPage() {
  return (
    <StaticPage title="Offres Flash">
      <div className="prose prose-slate max-w-none">
        <p>Profitez de nos meilleures offres du moment.</p>
        <p>Les promotions spéciales et les offres limitées seront disponibles ici.</p>
      </div>
    </StaticPage>
  );
}

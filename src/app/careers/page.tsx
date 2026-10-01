import type { Metadata } from "next";
import { StaticPage } from "@/components/content/StaticPage";

export const metadata: Metadata = { title: "Carrières | NexMart MA" };

export default function CareersPage() {
  return (
    <StaticPage title="Carrières">
      <div className="prose prose-slate max-w-none">
        <p>Rejoignez l'équipe NexMart et participez à notre croissance.</p>
        <p>Nous recherchons des talents passionnés pour rejoindre notre équipe.</p>
      </div>
    </StaticPage>
  );
}

import type { Metadata } from "next";
import { StaticPage } from "@/components/content/StaticPage";

export const metadata: Metadata = { title: "Durabilité | NexMart MA" };

export default function SustainabilityPage() {
  return (
    <StaticPage title="Durabilité">
      <p>NexMart s&apos;engage pour des emballages responsables et des partenaires logistiques optimisés.</p>
      <p>Nous mettons en avant l&apos;artisanat marocain et les producteurs locaux.</p>
    </StaticPage>
  );
}

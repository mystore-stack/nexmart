import type { Metadata } from "next";
import { StaticPage } from "@/components/content/StaticPage";

export const metadata: Metadata = { title: "DurabilitÃ© | NexStore MA" };

export default function SustainabilityPage() {
  return (
    <StaticPage title="DurabilitÃ©">
      <p>NexStore s&apos;engage pour des emballages responsables et des partenaires logistiques optimisÃ©s.</p>
      <p>Nous mettons en avant l&apos;artisanat marocain et les producteurs locaux.</p>
    </StaticPage>
  );
}


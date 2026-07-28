import { StaticPage } from "@/components/content/StaticPage";

export const metadata = { title: "Ã€ propos | NexStore MA" };

export default function AboutPage() {
  return (
    <StaticPage title="Ã€ propos de NexStore">
      <p>
        NexStore MA est une marketplace e-commerce premium dÃ©diÃ©e au marchÃ© marocain, avec livraison
        nationale et paiement sÃ©curisÃ©.
      </p>
      <p>
        Notre mission : rendre le shopping en ligne simple, rapide et fiable pour les familles et les
        professionnels au Maroc.
      </p>
    </StaticPage>
  );
}


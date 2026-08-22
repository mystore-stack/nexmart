import { StaticPage } from "@/components/content/StaticPage";

export const metadata = { title: "À propos | NexMart MA" };

export default function AboutPage() {
  return (
    <StaticPage title="À propos de NexMart">
      <p>
        NexMart MA est une marketplace e-commerce premium dédiée au marché marocain, avec livraison
        nationale et paiement sécurisé.
      </p>
      <p>
        Notre mission : rendre le shopping en ligne simple, rapide et fiable pour les familles et les
        professionnels au Maroc.
      </p>
    </StaticPage>
  );
}

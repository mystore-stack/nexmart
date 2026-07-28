import { StaticPage } from "@/components/content/StaticPage";

export const metadata = { title: "Livraison | NexStore MA" };

export default function ShippingPage() {
  return (
    <StaticPage title="Livraison">
      <p>Livraison au Maroc via Amana, Chrono Diali et Jibli.</p>
      <p>Gratuite Ã  partir de 500 MAD d&apos;achat (selon ville et transporteur).</p>
      <p>DÃ©lais indicatifs : 1 Ã  6 jours ouvrÃ©s selon la zone.</p>
    </StaticPage>
  );
}


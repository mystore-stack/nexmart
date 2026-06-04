import { StaticPage } from "@/components/content/StaticPage";

export const metadata = { title: "Livraison | NexMart MA" };

export default function ShippingPage() {
  return (
    <StaticPage title="Livraison">
      <p>Livraison au Maroc via Amana, Chrono Diali et Jibli.</p>
      <p>Gratuite à partir de 500 MAD d&apos;achat (selon ville et transporteur).</p>
      <p>Délais indicatifs : 1 à 6 jours ouvrés selon la zone.</p>
    </StaticPage>
  );
}

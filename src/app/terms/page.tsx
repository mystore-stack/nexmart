import { StaticPage } from "@/components/content/StaticPage";

export const metadata = { title: "Conditions | NexMart MA" };

export default function TermsPage() {
  return (
    <StaticPage title="Conditions générales">
      <p>
        En utilisant NexMart, vous acceptez nos conditions de vente, nos tarifs affichés en MAD et
        nos politiques de livraison et de retour.
      </p>
      <p>Les prix et disponibilités peuvent être modifiés sans préavis.</p>
    </StaticPage>
  );
}

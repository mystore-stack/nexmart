import type { Metadata } from "next";
import { StaticPage } from "@/components/content/StaticPage";

export const metadata: Metadata = { title: "Politique cookies | NexMart MA" };

export default function CookiesPage() {
  return (
    <StaticPage title="Politique cookies">
      <p>NexMart utilise des cookies essentiels pour la session, le panier et la sécurité.</p>
      <p>Des cookies analytiques peuvent être activés si vous acceptez les statistiques dans les paramètres du navigateur.</p>
      <p>Vous pouvez supprimer les cookies à tout moment via les paramètres de votre navigateur.</p>
    </StaticPage>
  );
}

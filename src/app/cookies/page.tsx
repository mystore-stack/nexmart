import type { Metadata } from "next";
import { StaticPage } from "@/components/content/StaticPage";

export const metadata: Metadata = { title: "Politique cookies | NexStore MA" };

export default function CookiesPage() {
  return (
    <StaticPage title="Politique cookies">
      <p>NexStore utilise des cookies essentiels pour la session, le panier et la sÃ©curitÃ©.</p>
      <p>Des cookies analytiques peuvent Ãªtre activÃ©s si vous acceptez les statistiques dans les paramÃ¨tres du navigateur.</p>
      <p>Vous pouvez supprimer les cookies Ã  tout moment via les paramÃ¨tres de votre navigateur.</p>
    </StaticPage>
  );
}


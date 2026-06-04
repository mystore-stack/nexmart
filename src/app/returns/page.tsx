import { StaticPage } from "@/components/content/StaticPage";

export const metadata = { title: "Retours | NexMart MA" };

export default function ReturnsPage() {
  return (
    <StaticPage title="Retours & remboursements">
      <p>Retour sous 14 jours pour les articles non utilisés, emballage d&apos;origine requis.</p>
      <p>Remboursement sous 5 à 10 jours ouvrés après inspection du colis.</p>
    </StaticPage>
  );
}

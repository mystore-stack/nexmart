import { StaticPage } from "@/components/content/StaticPage";

export const metadata = { title: "Confidentialité | NexMart MA" };

export default function PrivacyPage() {
  return (
    <StaticPage title="Politique de confidentialité">
      <p>
        Nous collectons uniquement les données nécessaires au compte, à la commande et au support
        client. Vos données ne sont pas vendues à des tiers.
      </p>
      <p>
        Vous pouvez demander l&apos;accès, la rectification ou la suppression de vos données en
        contactant support@nexmart.ma.
      </p>
    </StaticPage>
  );
}

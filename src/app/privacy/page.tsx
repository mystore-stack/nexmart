import { StaticPage } from "@/components/content/StaticPage";

export const metadata = { title: "ConfidentialitÃ© | NexStore MA" };

export default function PrivacyPage() {
  return (
    <StaticPage title="Politique de confidentialitÃ©">
      <p>
        Nous collectons uniquement les donnÃ©es nÃ©cessaires au compte, Ã  la commande et au support
        client. Vos donnÃ©es ne sont pas vendues Ã  des tiers.
      </p>
      <p>
        Vous pouvez demander l&apos;accÃ¨s, la rectification ou la suppression de vos donnÃ©es en
        contactant support@nexstore.ma.
      </p>
    </StaticPage>
  );
}


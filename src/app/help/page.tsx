import { StaticPage } from "@/components/content/StaticPage";
import Link from "next/link";

export const metadata = { title: "Aide | NexMart MA" };

export default function HelpPage() {
  return (
    <StaticPage title="Centre d'aide">
      <p>Questions fréquentes :</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <Link href="/shipping" className="text-primary hover:underline">
            Livraison et délais
          </Link>
        </li>
        <li>
          <Link href="/returns" className="text-primary hover:underline">
            Retours et remboursements
          </Link>
        </li>
        <li>
          <Link href="/contact" className="text-primary hover:underline">
            Contacter le support
          </Link>
        </li>
      </ul>
    </StaticPage>
  );
}

import { StaticPage } from "@/components/content/StaticPage";

export const metadata = { title: "Contact | NexMart MA" };

export default function ContactPage() {
  return (
    <StaticPage title="Contact">
      <p>Email : support@nexmart.ma</p>
      <p>Téléphone : +212 5XX-XXXXXX</p>
      <p>Horaires : lun–sam, 9h–18h (GMT+1)</p>
    </StaticPage>
  );
}

import { StaticPage } from "@/components/content/StaticPage";

export const metadata = { title: "Contact | NexStore MA" };

export default function ContactPage() {
  return (
    <StaticPage title="Contact">
      <p>Email : support@nexstore.ma</p>
      <p>TÃ©lÃ©phone : +212 5XX-XXXXXX</p>
      <p>Horaires : lunâ€“sam, 9hâ€“18h (GMT+1)</p>
    </StaticPage>
  );
}


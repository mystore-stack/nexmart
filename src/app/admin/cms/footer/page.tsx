import { requireCmsAccess } from "@/lib/cms/auth";
import { FooterManager } from "@/components/admin/cms/footer/FooterManager";

export default async function FooterCmsPage() {
  await requireCmsAccess();
  return <FooterManager />;
}

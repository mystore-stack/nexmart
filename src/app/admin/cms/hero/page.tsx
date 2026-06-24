import { requireCmsAccess } from "@/lib/cms/auth";
import { HeroBannerManager } from "@/components/admin/cms/hero/HeroBannerManager";

export default async function CmsHeroPage() {
  await requireCmsAccess();
  return <HeroBannerManager />;
}

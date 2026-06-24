import { requireCmsAccess } from "@/lib/cms/auth";
import { BrandManager } from "@/components/admin/cms/brands/BrandManager";

export default async function BrandsPage() {
  await requireCmsAccess();
  return <BrandManager />;
}

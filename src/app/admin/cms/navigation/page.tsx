import { requireCmsAccess } from "@/lib/cms/auth";
import { NavigationManager } from "@/components/admin/cms/navigation/NavigationManager";

export default async function NavigationPage() {
  await requireCmsAccess();
  return <NavigationManager />;
}

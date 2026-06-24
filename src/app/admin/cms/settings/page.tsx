import { requireCmsAccess } from "@/lib/cms/auth";
import { getSiteSettings } from "@/lib/cms/data";
import { SiteSettingsManager } from "@/components/admin/cms/settings/SiteSettingsManager";

export default async function SiteSettingsPage() {
  await requireCmsAccess();
  const settings = await getSiteSettings();
  return <SiteSettingsManager initial={settings} />;
}

import { requireCmsAccess } from "@/lib/cms/auth";
import { AnnouncementManager } from "@/components/admin/cms/announcement/AnnouncementManager";

export default async function AnnouncementCmsPage() {
  await requireCmsAccess();
  return <AnnouncementManager />;
}

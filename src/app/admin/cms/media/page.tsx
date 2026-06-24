import { requireCmsAccess } from "@/lib/cms/auth";
import { MediaLibraryEnterprise } from "@/components/admin/cms/media/MediaLibraryEnterprise";

export default async function MediaCmsPage() {
  await requireCmsAccess();
  return <MediaLibraryEnterprise />;
}

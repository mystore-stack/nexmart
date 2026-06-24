import { revalidatePath, revalidateTag } from "next/cache";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { invalidateCMSCache } from "@/lib/cms/cache";

const CMS_TAGS = {
  settings: (orgId: string) => `cms:settings:${orgId}`,
  footer: (orgId: string) => `cms:footer:${orgId}`,
  navigation: (orgId: string) => `cms:navigation:${orgId}`,
  announcement: (orgId: string) => `cms:announcement:${orgId}`,
  hero: (orgId: string) => `cms:hero:${orgId}`,
  homepage: (orgId: string) => `cms:homepage:${orgId}`,
} as const;

export async function revalidateSiteContent(organizationId?: string) {
  const orgId = organizationId ?? (await getDefaultOrganizationId());

  Object.values(CMS_TAGS).forEach((tagFn) => revalidateTag(tagFn(orgId)));

  await invalidateCMSCache("settings", orgId).catch(() => {});
  await invalidateCMSCache("footer", orgId).catch(() => {});
  await invalidateCMSCache("announcement", orgId).catch(() => {});
  await invalidateCMSCache("navigation", orgId).catch(() => {});
  await invalidateCMSCache("hero", orgId).catch(() => {});
  await invalidateCMSCache("homepage", orgId).catch(() => {});

  revalidatePath("/", "layout");
  revalidatePath("/");
}

export { CMS_TAGS };

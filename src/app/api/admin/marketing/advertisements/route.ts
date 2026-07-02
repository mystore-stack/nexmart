import { requireAdmin } from "@/lib/auth-api";
import { withAdmin } from "@/lib/withApi";
import { ok, created } from "@/lib/api-response";
import { advertisementSchema, parseDate } from "@/lib/marketing/schemas";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";

export const GET = withAdmin(async ({ req }) => {
  const { organizationId } = await requireAdmin();
  const { searchParams } = new URL(req.url);
  const placement = searchParams.get("placement");
  const status = searchParams.get("status");
  const campaignId = searchParams.get("campaignId");

  const ads = await prisma.advertisement.findMany({
    where: {
      organizationId,
      ...(placement ? { placement: placement as never } : {}),
      ...(status ? { status: status as never } : {}),
      ...(campaignId ? { campaignId } : {}),
    },
    include: { campaign: { select: { id: true, name: true, type: true } } },
    orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
  });

  return ok(ads);
});

export const POST = withAdmin(async ({ req }) => {
  const { organizationId } = await requireAdmin();
  const body = await req.json();
  const data = advertisementSchema.parse(body);

  const ad = await prisma.advertisement.create({
    data: {
      organizationId,
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      imageDesktop: data.imageDesktop,
      imageMobile: data.imageMobile,
      videoUrl: data.videoUrl,
      ctaText: data.ctaText,
      ctaUrl: data.ctaUrl,
      backgroundColor: data.backgroundColor,
      textColor: data.textColor,
      placement: data.placement,
      priority: data.priority,
      status: data.status,
      startDate: parseDate(data.startDate),
      endDate: parseDate(data.endDate),
      campaignId: data.campaignId,
      targetCountries: data.targetCountries,
      targetLanguages: data.targetLanguages,
      targetDevices: data.targetDevices,
      visitorTarget: data.visitorTarget,
    },
    include: { campaign: { select: { id: true, name: true, type: true } } },
  });

  revalidateTag("marketing-ads");
  return created(ad);
});

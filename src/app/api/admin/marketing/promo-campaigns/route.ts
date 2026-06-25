import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-api";
import { withAdmin } from "@/lib/withApi";
import { ok, created } from "@/lib/api-response";
import { promoCampaignSchema, parseDate, slugify } from "@/lib/marketing/schemas";
import { revalidateTag } from "next/cache";

export const GET = withAdmin(async () => {
  const { organizationId } = await requireAdmin();

  const campaigns = await prisma.promoCampaign.findMany({
    where: { organizationId },
    include: { _count: { select: { advertisements: true, flashDeals: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return ok(campaigns);
});

export const POST = withAdmin(async ({ req }) => {
  const { organizationId } = await requireAdmin();
  const body = await req.json();
  const data = promoCampaignSchema.parse({
    ...body,
    slug: body.slug || slugify(body.name),
  });

  const campaign = await prisma.promoCampaign.create({
    data: {
      organizationId,
      name: data.name,
      slug: data.slug,
      type: data.type,
      description: data.description,
      status: data.status,
      startDate: parseDate(data.startDate),
      endDate: parseDate(data.endDate),
      bannerColor: data.bannerColor,
    },
    include: { _count: { select: { advertisements: true, flashDeals: true } } },
  });

  revalidateTag("marketing-ads");
  return created(campaign);
});

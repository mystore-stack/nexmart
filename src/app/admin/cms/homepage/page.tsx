import { prisma } from "@/lib/prisma";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { requireCmsAccess } from "@/lib/cms/auth";
import { HomepageBuilder } from "@/components/admin/cms/homepage/HomepageBuilder";
import { DEFAULT_HOMEPAGE_SECTIONS } from "@/lib/cms/constants";
import type { HomepageSectionType } from "@prisma/client";

export default async function HomepageBuilderPage() {
  await requireCmsAccess();
  const orgId = await getDefaultOrganizationId();

  let config = await prisma.homepageConfig.findFirst({
    where: { organizationId: orgId },
    include: {
      sections: { orderBy: { displayOrder: "asc" } },
      versions: { orderBy: { version: "desc" }, take: 10 },
    },
  });

  if (!config) {
    config = await prisma.homepageConfig.create({
      data: {
        organizationId: orgId,
        featuredCategories: [],
        featuredProducts: [],
        featuredBrands: [],
        testimonials: [],
        status: "DRAFT",
        sections: {
          create: DEFAULT_HOMEPAGE_SECTIONS.map((type, index) => ({
            type: type as HomepageSectionType,
            title: type.replace(/_/g, " "),
            config: {},
            isVisible: true,
            displayOrder: index,
          })),
        },
      },
      include: {
        sections: { orderBy: { displayOrder: "asc" } },
        versions: { orderBy: { version: "desc" }, take: 10 },
      },
    });
  }

  return (
    <HomepageBuilder
      initialSections={config.sections.map((s) => ({
        id: s.id,
        type: s.type,
        title: s.title,
        subtitle: s.subtitle,
        config: (s.config as Record<string, unknown>) ?? {},
        isVisible: s.isVisible,
        displayOrder: s.displayOrder,
      }))}
      initialStatus={config.status}
      initialVersion={config.version}
      versions={config.versions.map((v) => ({
        id: v.id,
        version: v.version,
        note: v.note,
        createdAt: v.createdAt.toISOString(),
      }))}
      newsletter={{
        enabled: config.newsletterEnabled,
        title: config.newsletterTitle,
        subtitle: config.newsletterSubtitle,
      }}
    />
  );
}

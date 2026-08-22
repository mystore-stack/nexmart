import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HOMEPAGE_SECTION_REGISTRY } from "@/lib/homepage/registry";
import { getDefaultOrganizationId } from "@/lib/tenant";
import { SectionList } from "./SectionList";

export const dynamic = "force-dynamic";

export default async function HomepageCmsDashboard() {
  const organizationId = await getDefaultOrganizationId();

  // Fetch all existing sections from DB
  const dbSections = await prisma.homePageSection.findMany({
    orderBy: { displayOrder: "asc" }
  });

  // Ensure all registered sections exist in the DB (Seed if missing)
  const existingKeys = new Set(dbSections.map((s) => s.sectionKey));
  const missingSections = HOMEPAGE_SECTION_REGISTRY.filter((k) => !existingKeys.has(k));

  if (missingSections.length > 0) {
    // create missing sections
    await prisma.homePageSection.createMany({
      data: missingSections.map((key, index) => ({
        sectionKey: key,
        title: key.replace(/([A-Z])/g, " $1").trim(),
        displayOrder: dbSections.length + index,
        active: true,
      })),
      skipDuplicates: true,
    });
  }

  // Refetch if we added missing
  const sections = missingSections.length > 0 
    ? await prisma.homePageSection.findMany({
        orderBy: { displayOrder: "asc" }
      })
    : dbSections;

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Homepage CMS</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the real homepage sections, their order, and specialized configurations.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="px-4 py-2 border rounded-xl hover:bg-muted"
        >
          View Live Homepage
        </Link>
      </div>

      <div className="grid gap-4">
        <SectionList initialSections={sections} />
      </div>
    </div>
  );
}

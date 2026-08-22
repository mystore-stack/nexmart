import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HOMEPAGE_SECTION_REGISTRY, normalizeHomepageSectionKey } from "@/lib/homepage/registry";
import { EditorForm } from "./EditorForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function SectionEditorPage({
  params,
}: {
  params: Promise<{ sectionKey: string }>;
}) {
  const { sectionKey } = await params;
  const normalizedKey = normalizeHomepageSectionKey(sectionKey);
  if (!normalizedKey || !HOMEPAGE_SECTION_REGISTRY.includes(normalizedKey)) {
    return notFound();
  }

  // Fetch the section
  const section = await prisma.homePageSection.findFirst({
    where: { sectionKey: normalizedKey },
  });

  if (!section) {
    return notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-8">
      <div className="flex items-center gap-4 border-b pb-6">
        <Link href="/admin/cms/homepage" className="p-2 hover:bg-muted rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Section: {section.title}</h1>
          <p className="text-muted-foreground mt-1">Configure {normalizedKey} content and products.</p>
        </div>
      </div>

      <div className="bg-card border rounded-2xl shadow-sm p-6">
        <EditorForm 
          section={section} 
          parsedConfig={typeof section.config === "string" ? JSON.parse(section.config) : (section.config || {})} 
        />
      </div>
    </div>
  );
}

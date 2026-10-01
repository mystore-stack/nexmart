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
    <div className="space-y-6 max-w-6xl mx-auto p-8">
      <div className="flex items-center gap-4 pb-6">
        <Link 
          href="/admin/cms/homepage" 
          className="p-3 hover:bg-emerald-50 rounded-full transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-emerald-600 transition-colors" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Section: {section.title}</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
              {normalizedKey}
            </span>
            Configure content and products for this homepage section.
          </p>
        </div>
        <div className={`px-4 py-2 rounded-xl text-sm font-semibold ${
          section.enabled 
            ? "bg-emerald-100 text-emerald-700" 
            : "bg-gray-100 text-gray-600"
        }`}>
          {section.enabled ? "Active" : "Inactive"}
        </div>
      </div>

      <div className="bg-white border-2 border-emerald-100 rounded-3xl shadow-lg p-8">
        <EditorForm 
          section={section} 
          parsedConfig={typeof section.config === "string" ? JSON.parse(section.config) : (section.config || {})} 
        />
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

interface PageSection {
  id: string;
  sectionType: string;
  content: any;
  order: number;
}

interface PageBuilderPage {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  sections: PageSection[];
}

export default function PagePreviewPage({ params }: { params: Promise<{ pageId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [page, setPage] = useState<PageBuilderPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPage();
  }, [resolvedParams.pageId]);

  const fetchPage = async () => {
    try {
      const res = await fetch(`/api/admin/page-builder/pages/${resolvedParams.pageId}`, {
        credentials: "include",
      });
      const data = await res.json();
      
      if (data.success) {
        setPage(data.data);
      } else {
        setError(data.error || "Failed to load page");
      }
    } catch (error) {
      console.error("Failed to load page", error);
      setError("Failed to load page");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || "Page not found"}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-primary text-white rounded"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Preview Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="font-semibold">{page.title}</h1>
              <p className="text-sm text-muted-foreground">Preview Mode</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs rounded ${
              page.published ? "bg-green-100 text-green-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {page.published ? "PUBLISHED" : "DRAFT"}
            </span>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="pt-16">
        {page.sections && page.sections.length > 0 ? (
          page.sections.map((section: any) => (
            <div key={section.id} className="py-8">
              <div className="max-w-7xl mx-auto px-4">
                <div className="bg-gray-50 border rounded p-8">
                  <h3 className="font-semibold mb-2">{section.sectionType}</h3>
                  <pre className="text-xs text-muted-foreground overflow-auto">
                    {JSON.stringify(section.content, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <p className="text-muted-foreground">No sections configured</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BuilderLayout } from "@/components/page-builder/builder";
import type { PageBuilderPage, PageSection } from "@prisma/client";

export default function VisualBuilderPage({ params }: { params: { pageId: string } }) {
  const router = useRouter();
  const [page, setPage] = useState<PageBuilderPage & { sections: PageSection[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, [params.pageId]);

  const fetchPage = async () => {
    try {
      const res = await fetch(`/api/admin/page-builder/pages/${params.pageId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setPage(data.data);
      }
    } catch (error) {
      console.error("Failed to load page", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedPage: PageBuilderPage & { sections: PageSection[] }) => {
    try {
      const res = await fetch(`/api/admin/page-builder/pages/${params.pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPage),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to save");

      setPage(updatedPage);
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to save", error);
      return Promise.reject(error);
    }
  };

  const handlePublish = async (updatedPage: PageBuilderPage & { sections: PageSection[] }) => {
    try {
      const res = await fetch(`/api/admin/page-builder/pages/${params.pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...updatedPage, status: "PUBLISHED" }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to publish");

      setPage({ ...updatedPage, status: "PUBLISHED" });
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to publish", error);
      return Promise.reject(error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Page not found</p>
      </div>
    );
  }

  return (
    <BuilderLayout
      page={page}
      onSave={handleSave}
      onPublish={handlePublish}
    />
  );
}

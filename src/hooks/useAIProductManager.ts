"use client";

import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type {
  AIProductGenerationRecord,
  AIProductInput,
  AIProductManagerBootstrap,
  AIProductPublishInput,
} from "@/types/ai-products";

export function useAIProductManager(initialData: AIProductManagerBootstrap) {
  const [generations, setGenerations] = useState<AIProductGenerationRecord[]>(initialData.generations);
  const [products, setProducts] = useState(initialData.products);
  const [selectedId, setSelectedId] = useState<string | null>(initialData.generations[0]?.id || null);
  const [loading, setLoading] = useState(false);

  const selectedGeneration = useMemo(
    () => generations.find((generation) => generation.id === selectedId) || generations[0] || null,
    [generations, selectedId]
  );

  const refresh = useCallback(async () => {
    const response = await fetch("/api/admin/ai/products", { credentials: "include" });
    const data = await response.json();
    if (data.success) {
      setGenerations(data.data.generations);
      setProducts(data.data.products);
      setSelectedId((current) => current || data.data.generations[0]?.id || null);
    }
  }, []);

  const generate = useCallback(async (input: AIProductInput) => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/ai/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(input),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "AI generation failed");
      setGenerations((current) => [data.data, ...current]);
      setSelectedId(data.data.id);
      toast.success("AI product draft generated");
      return data.data as AIProductGenerationRecord;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI generation failed");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const optimize = useCallback(async (productId: string, instruction: string, notes?: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/ai/products/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, instruction, notes }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "AI optimization failed");
      setGenerations((current) => [data.data, ...current]);
      setSelectedId(data.data.id);
      toast.success("AI optimization draft ready");
      return data.data as AIProductGenerationRecord;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI optimization failed");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkCreate = useCallback(async (payload: { csv?: string; imageUrls?: string[]; workflow: string }) => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/ai/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Bulk generation failed");
      setGenerations((current) => [...data.data.generations, ...current]);
      setSelectedId(data.data.generations[0]?.id || null);
      toast.success(`${data.data.count} products queued`);
      return data.data.generations as AIProductGenerationRecord[];
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bulk generation failed");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const publish = useCallback(async (payload: AIProductPublishInput) => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/ai/products/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Publish failed");
      toast.success(data.data.action === "AUTO_PUBLISHED" ? "Product published" : "Product saved for review");
      await refresh();
      return data.data.product;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Publish failed");
      return null;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  return {
    categories: initialData.categories,
    products,
    generations,
    selectedGeneration,
    selectedId,
    setSelectedId,
    loading,
    generate,
    optimize,
    bulkCreate,
    publish,
    refresh,
  };
}

"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  Bot,
  CheckCircle2,
  FileText,
  Globe2,
  ImagePlus,
  Languages,
  LayoutList,
  Package,
  RefreshCw,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Upload,
  Wand2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAIProductManager } from "@/hooks/useAIProductManager";
import type {
  AIProductGenerationRecord,
  AIProductManagerBootstrap,
  AIProductWorkflow,
} from "@/types/ai-products";
import { AIDashboard } from "./AIDashboard";
import { AIModelSelector } from "./AIModelSelector";
import { AILanguageSelector } from "./AILanguageSelector";
import { SEOAnalyzer } from "./SEOAnalyzer";
import { ImageAI } from "./ImageAI";
import { PriceEngine } from "./PriceEngine";
import { SmartEditor } from "./SmartEditor";
import { ReviewWorkflow } from "./ReviewWorkflow";
import { BulkGenerator } from "./BulkGenerator";
import { QueueSystem } from "./QueueSystem";
import { AnalyticsDashboard } from "./AnalyticsDashboard";
import { ExportImport } from "./ExportImport";
import { AdminSettings } from "./AdminSettings";

interface Props {
  initialData: AIProductManagerBootstrap;
}

const workflows: Array<{ value: AIProductWorkflow; label: string; description: string }> = [
  { value: "DRAFT", label: "Draft", description: "Create product as an unpublished draft." },
  { value: "REVIEW_REQUIRED", label: "Review", description: "Queue the product for manual approval." },
  { value: "AUTO_PUBLISH", label: "Auto Publish", description: "Publish immediately after revision capture." },
];

export default function AIProductManager({ initialData }: Props) {
  const {
    categories,
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
  } = useAIProductManager(initialData);

  const fileRef = useRef<HTMLInputElement>(null);
  const bulkFileRef = useRef<HTMLInputElement>(null);
  const [productName, setProductName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [supplierInfo, setSupplierInfo] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [bulkCsv, setBulkCsv] = useState("");
  const [bulkWorkflow, setBulkWorkflow] = useState<AIProductWorkflow>("REVIEW_REQUIRED");
  const [optimizeProductId, setOptimizeProductId] = useState(products[0]?.id || "");
  const [optimizeInstruction, setOptimizeInstruction] = useState("full");
  const [optimizeNotes, setOptimizeNotes] = useState("");

  const [review, setReview] = useState({
    title: "",
    description: "",
    categoryId: categories[0]?.id || "",
    price: "0",
    comparePrice: "",
    cost: "",
    sku: "",
    stock: "0",
    lowStockAt: "5",
    weight: "",
    tags: "",
    featured: false,
    workflow: "REVIEW_REQUIRED" as AIProductWorkflow,
    revisionNote: "",
  });

  useEffect(() => {
    if (!selectedGeneration) return;
    setReview({
      title: selectedGeneration.output.title,
      description: selectedGeneration.output.longDescription,
      categoryId: selectedGeneration.selectedCategoryId || categories[0]?.id || "",
      price: "0",
      comparePrice: "",
      cost: "",
      sku: buildSku(selectedGeneration.output.title),
      stock: "0",
      lowStockAt: "5",
      weight: "",
      tags: selectedGeneration.output.tags.join(", "),
      featured: false,
      workflow: selectedGeneration.workflow || "REVIEW_REQUIRED",
      revisionNote: `AI Product Manager ${new Date().toISOString().slice(0, 10)}`,
    });
    setImageUrls(selectedGeneration.input?.imageUrls || []);
  }, [selectedGeneration, categories]);

  const queueStats = useMemo(() => {
    const ready = generations.filter((item) => item.status === "READY").length;
    const reviewRequired = generations.filter((item) => item.status === "REVIEW_REQUIRED").length;
    const published = generations.filter((item) => item.status === "PUBLISHED").length;
    const avgQuality = generations.length
      ? Math.round(generations.reduce((sum, item) => sum + (item.qualityScore || 0), 0) / generations.length)
      : 0;
    return { ready, reviewRequired, published, avgQuality };
  }, [generations]);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "products");
        const response = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await response.json();
        if (data.success && data.data?.path) uploaded.push(data.data.path);
      }
      setImageUrls((current) => [...current, ...uploaded]);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
      if (bulkFileRef.current) bulkFileRef.current.value = "";
    }
  };

  const selectedImages = imageUrls.length ? imageUrls : selectedGeneration?.input?.imageUrls || [];

  const handleGenerate = async () => {
    const generated = await generate({
      productName,
      supplierInfo,
      productUrl,
      imageUrls,
      targetLanguage: "fr",
      tone: "premium",
    });
    if (generated) {
      setProductName("");
      setProductUrl("");
      setSupplierInfo("");
    }
  };

  const handlePublish = async () => {
    if (!selectedGeneration) return;
    await publish({
      generationId: selectedGeneration.id,
      productId: selectedGeneration.productId || undefined,
      workflow: review.workflow,
      categoryId: review.categoryId,
      price: Number(review.price),
      comparePrice: review.comparePrice ? Number(review.comparePrice) : null,
      cost: review.cost ? Number(review.cost) : null,
      sku: review.sku,
      stock: Number(review.stock),
      lowStockAt: Number(review.lowStockAt),
      weight: review.weight ? Number(review.weight) : null,
      images: selectedImages.length ? selectedImages : ["/placeholder.jpg"],
      tags: review.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      title: review.title,
      description: review.description,
      featured: review.featured,
      revisionNote: review.revisionNote,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-700">
            <Bot className="h-4 w-4" />
            AI Product Manager
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-normal">AI Product Studio</h1>
          <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
            Create, optimize, review, and publish AI generated product pages with revision history and rollback protection.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/products" className="btn-outline px-4 py-2 text-sm">
            <Package className="h-4 w-4" />
            Catalog
          </Link>
          <button className="btn-primary px-4 py-2 text-sm" onClick={handleGenerate} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Generate Product
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Metric icon={LayoutList} label="Queue" value={generations.length} tone="neutral" />
        <Metric icon={Search} label="Ready" value={queueStats.ready} tone="blue" />
        <Metric icon={ShieldCheck} label="Needs Review" value={queueStats.reviewRequired} tone="amber" />
        <Metric icon={BarChart3} label="Avg Quality" value={`${queueStats.avgQuality}/100`} tone="green" />
      </div>

      <Tabs defaultValue="dashboard" className="space-y-5">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-lg">
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="create" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="review" className="gap-2">
            <FileText className="h-4 w-4" />
            Review
          </TabsTrigger>
          <TabsTrigger value="editor" className="gap-2">
            <Wand2 className="h-4 w-4" />
            Smart Editor
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Search className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="images" className="gap-2">
            <ImagePlus className="h-4 w-4" />
            Images
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="bulk" className="gap-2">
            <Upload className="h-4 w-4" />
            Bulk
          </TabsTrigger>
          <TabsTrigger value="queue" className="gap-2">
            <LayoutList className="h-4 w-4" />
            Queue
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-2">
            <Globe2 className="h-4 w-4" />
            Export/Import
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <AIDashboard />
        </TabsContent>

        <TabsContent value="create" className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <QueuePanel generations={generations} selectedId={selectedId} onSelect={setSelectedId} />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="rounded-lg border border-border bg-card p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-bold">AI Generation Panel</h2>
                  <p className="text-sm text-muted-foreground">Combine images, supplier copy, URL, and manual naming.</p>
                </div>
                <Sparkles className="h-5 w-5 text-brand-700" />
              </div>

              <div className="grid gap-4">
                <Field label="Product name">
                  <input className="input" value={productName} onChange={(event) => setProductName(event.target.value)} placeholder="Handmade leather pouf" />
                </Field>
                <Field label="Supplier product URL">
                  <input className="input" value={productUrl} onChange={(event) => setProductUrl(event.target.value)} placeholder="https://supplier.example/product" />
                </Field>
                <Field label="Supplier product information">
                  <textarea
                    className="input min-h-[180px] resize-y"
                    value={supplierInfo}
                    onChange={(event) => setSupplierInfo(event.target.value)}
                    placeholder="Paste supplier specs, materials, dimensions, price notes, variants, and shipping details..."
                  />
                </Field>

                <div className="rounded-lg border border-dashed border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">Product images</p>
                      <p className="text-xs text-muted-foreground">Upload multiple images for vision analysis and alt text.</p>
                    </div>
                    <button type="button" className="btn-outline px-4 py-2 text-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                      Upload
                    </button>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => handleUpload(event.target.files)} />
                  <ImageStrip images={imageUrls} onRemove={(image) => setImageUrls((current) => current.filter((item) => item !== image))} />
                </div>

                <button type="button" className="btn-primary justify-center py-3" onClick={handleGenerate} disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  Generate AI Product
                </button>
              </div>
            </section>

            <PreviewPanel generation={selectedGeneration} images={selectedImages} />
          </div>
        </TabsContent>

        <TabsContent value="review" className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <QueuePanel generations={generations} selectedId={selectedId} onSelect={setSelectedId} />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="rounded-lg border border-border bg-card p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-bold">Review Panel</h2>
                  <p className="text-sm text-muted-foreground">Override AI suggestions before a product is created or updated.</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>

              {selectedGeneration ? (
                <div className="grid gap-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Field label="Product title">
                      <input className="input" value={review.title} onChange={(event) => setReview((current) => ({ ...current, title: event.target.value }))} />
                    </Field>
                    <Field label="Category">
                      <select className="input" value={review.categoryId} onChange={(event) => setReview((current) => ({ ...current, categoryId: event.target.value }))}>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="Long description">
                    <textarea className="input min-h-[220px] resize-y" value={review.description} onChange={(event) => setReview((current) => ({ ...current, description: event.target.value }))} />
                  </Field>

                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Price">
                      <input className="input" type="number" min="0" step="0.01" value={review.price} onChange={(event) => setReview((current) => ({ ...current, price: event.target.value }))} />
                    </Field>
                    <Field label="Compare price">
                      <input className="input" type="number" min="0" step="0.01" value={review.comparePrice} onChange={(event) => setReview((current) => ({ ...current, comparePrice: event.target.value }))} />
                    </Field>
                    <Field label="Cost">
                      <input className="input" type="number" min="0" step="0.01" value={review.cost} onChange={(event) => setReview((current) => ({ ...current, cost: event.target.value }))} />
                    </Field>
                    <Field label="SKU">
                      <input className="input" value={review.sku} onChange={(event) => setReview((current) => ({ ...current, sku: event.target.value }))} />
                    </Field>
                    <Field label="Stock">
                      <input className="input" type="number" min="0" value={review.stock} onChange={(event) => setReview((current) => ({ ...current, stock: event.target.value }))} />
                    </Field>
                    <Field label="Low stock alert">
                      <input className="input" type="number" min="0" value={review.lowStockAt} onChange={(event) => setReview((current) => ({ ...current, lowStockAt: event.target.value }))} />
                    </Field>
                  </div>

                  <Field label="Tags">
                    <input className="input" value={review.tags} onChange={(event) => setReview((current) => ({ ...current, tags: event.target.value }))} />
                  </Field>

                  <div className="grid gap-3 lg:grid-cols-3">
                    {workflows.map((workflow) => (
                      <button
                        type="button"
                        key={workflow.value}
                        onClick={() => setReview((current) => ({ ...current, workflow: workflow.value }))}
                        className={`rounded-lg border p-4 text-left transition ${
                          review.workflow === workflow.value ? "border-brand-700 bg-brand-50 text-brand-900" : "border-border bg-background hover:border-foreground/20"
                        }`}
                      >
                        <p className="text-sm font-bold">{workflow.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{workflow.description}</p>
                      </button>
                    ))}
                  </div>

                  <label className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
                    <input
                      type="checkbox"
                      checked={review.featured}
                      onChange={(event) => setReview((current) => ({ ...current, featured: event.target.checked }))}
                      className="h-4 w-4"
                    />
                    Featured product
                  </label>

                  <Field label="Revision note">
                    <input className="input" value={review.revisionNote} onChange={(event) => setReview((current) => ({ ...current, revisionNote: event.target.value }))} />
                  </Field>

                  <button type="button" className="btn-primary justify-center py-3" onClick={handlePublish} disabled={loading || !review.categoryId}>
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                    Save Through Publish Workflow
                  </button>
                </div>
              ) : (
                <EmptyPanel title="No AI draft selected" />
              )}
            </section>

            <PublishingPanel generation={selectedGeneration} reviewWorkflow={review.workflow} />
          </div>
        </TabsContent>

        <TabsContent value="editor" className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="rounded-lg border border-border bg-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold">Smart Product Editor</h2>
                <p className="text-sm text-muted-foreground">Rewrite descriptions, improve SEO, titles, marketing copy, and FAQ for existing products.</p>
              </div>
              <Wand2 className="h-5 w-5 text-brand-700" />
            </div>
            <div className="grid gap-4">
              <Field label="Existing product">
                <select className="input" value={optimizeProductId} onChange={(event) => setOptimizeProductId(event.target.value)}>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>
                  ))}
                </select>
              </Field>
              <Field label="AI action">
                <select className="input" value={optimizeInstruction} onChange={(event) => setOptimizeInstruction(event.target.value)}>
                  <option value="full">Full optimization</option>
                  <option value="rewrite">Rewrite descriptions</option>
                  <option value="seo">Improve SEO</option>
                  <option value="title">Generate better titles</option>
                  <option value="marketing">Generate marketing copy</option>
                  <option value="faq">Generate FAQ</option>
                </select>
              </Field>
              <Field label="Editor notes">
                <textarea className="input min-h-[150px]" value={optimizeNotes} onChange={(event) => setOptimizeNotes(event.target.value)} placeholder="Preserve handmade positioning, emphasize giftability, add French keywords..." />
              </Field>
              <button className="btn-primary justify-center py-3" disabled={loading || !optimizeProductId} onClick={() => optimize(optimizeProductId, optimizeInstruction, optimizeNotes)}>
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate Optimization Draft
              </button>
            </div>
          </section>
          <SuggestionPanel generation={selectedGeneration} />
        </TabsContent>

        <TabsContent value="bulk" className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="rounded-lg border border-border bg-card p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold">Bulk Product Creation</h2>
                <p className="text-sm text-muted-foreground">Upload CSV content or multiple product images to generate products in batch.</p>
              </div>
              <Upload className="h-5 w-5 text-brand-700" />
            </div>
            <div className="grid gap-4">
              <Field label="CSV content">
                <textarea className="input min-h-[260px] font-mono text-xs" value={bulkCsv} onChange={(event) => setBulkCsv(event.target.value)} placeholder="name,description,url,images&#10;Leather pouf,Handmade Moroccan leather pouf,https://supplier/item,/uploads/products/a.jpg|/uploads/products/b.jpg" />
              </Field>
              <div className="flex flex-wrap gap-2">
                <button className="btn-outline px-4 py-2 text-sm" onClick={() => bulkFileRef.current?.click()} disabled={uploading}>
                  <ImagePlus className="h-4 w-4" />
                  Upload Batch Images
                </button>
                <input ref={bulkFileRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => handleUpload(event.target.files)} />
                <select className="input max-w-[220px]" value={bulkWorkflow} onChange={(event) => setBulkWorkflow(event.target.value as AIProductWorkflow)}>
                  {workflows.map((workflow) => (
                    <option key={workflow.value} value={workflow.value}>{workflow.label}</option>
                  ))}
                </select>
              </div>
              <ImageStrip images={imageUrls} onRemove={(image) => setImageUrls((current) => current.filter((item) => item !== image))} />
              <button className="btn-primary justify-center py-3" disabled={loading || (!bulkCsv && !imageUrls.length)} onClick={() => bulkCreate({ csv: bulkCsv, imageUrls, workflow: bulkWorkflow })}>
                {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Generate Batch
              </button>
            </div>
          </section>
          <QueuePanel generations={generations} selectedId={selectedId} onSelect={setSelectedId} />
        </TabsContent>

        <TabsContent value="analytics" className="grid gap-5 lg:grid-cols-3">
          <AnalyticsPanel generations={generations} />
          <section className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
            <h2 className="font-bold">Quality Distribution</h2>
            <div className="mt-5 space-y-3">
              {generations.slice(0, 10).map((generation) => (
                <div key={generation.id} className="grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)_64px] sm:items-center">
                  <p className="truncate text-sm font-medium">{generation.output.title}</p>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-emerald-600" style={{ width: `${generation.qualityScore || 0}%` }} />
                  </div>
                  <p className="text-right text-sm font-bold">{generation.qualityScore || 0}/100</p>
                </div>
              ))}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <SEOAnalyzer 
              content={{
                title: selectedGeneration?.output.title || "",
                description: selectedGeneration?.output.longDescription || "",
                slug: selectedGeneration?.output.title.toLowerCase().replace(/\s+/g, "-") || "",
                content: selectedGeneration?.output.longDescription || "",
              }}
            />
            <div className="space-y-6">
              <AIModelSelector 
                selectedModel="GPT_4"
                onModelChange={(model) => console.log("Model changed:", model)}
              />
              <AILanguageSelector 
                selectedLanguage="EN"
                onLanguageChange={(lang) => console.log("Language changed:", lang)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="images" className="space-y-6">
          <ImageAI 
            images={selectedImages}
            onImagesChange={(images) => setImageUrls(images)}
          />
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <PriceEngine 
            cost={Number(review.cost) || 0}
            currentPrice={Number(review.price) || 0}
            onPriceSuggestion={(price) => setReview(prev => ({ ...prev, price: price.toString() }))}
          />
        </TabsContent>

        <TabsContent value="queue" className="space-y-6">
          <QueueSystem />
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <ExportImport />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <AdminSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function QueuePanel({ generations, selectedId, onSelect }: { generations: AIProductGenerationRecord[]; selectedId: string | null; onSelect: (id: string) => void }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-bold">Product Queue</h2>
          <p className="text-xs text-muted-foreground">{generations.length} AI drafts</p>
        </div>
        <LayoutList className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="space-y-2">
        {generations.length ? generations.map((generation) => (
          <button
            key={generation.id}
            onClick={() => onSelect(generation.id)}
            className={`w-full rounded-lg border p-3 text-left transition ${
              selectedId === generation.id ? "border-brand-700 bg-brand-50" : "border-border bg-background hover:border-foreground/20"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{generation.output.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{generation.kind.replace("_", " ")} - {generation.status}</p>
              </div>
              <ScoreRing score={generation.qualityScore || 0} />
            </div>
          </button>
        )) : <EmptyPanel title="No products queued" />}
      </div>
    </section>
  );
}

function PreviewPanel({ generation, images }: { generation: AIProductGenerationRecord | null; images: string[] }) {
  if (!generation) return <EmptyPanel title="Generate a product to preview it" />;
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-bold">Live Preview</h2>
          <p className="text-xs text-muted-foreground">Customer-facing product page draft.</p>
        </div>
        <Globe2 className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          {images[0] ? (
            <Image src={images[0]} alt={generation.output.imageAnalysis[0]?.altText || generation.output.title} fill className="object-cover" sizes="360px" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image</div>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">{generation.output.brand} / {generation.output.category}</p>
          <h3 className="mt-1 text-xl font-black">{generation.output.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{generation.output.shortDescription}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {generation.output.tags.slice(0, 6).map((tag) => (
            <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{tag}</span>
          ))}
        </div>
        <div className="space-y-2">
          {generation.output.highlights.slice(0, 4).map((highlight) => (
            <div key={highlight} className="flex gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
              <span>{highlight}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PublishingPanel({ generation, reviewWorkflow }: { generation: AIProductGenerationRecord | null; reviewWorkflow: AIProductWorkflow }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-bold">Publishing Panel</h2>
          <p className="text-xs text-muted-foreground">Revision history is always retained.</p>
        </div>
        <ShieldCheck className="h-5 w-5 text-emerald-600" />
      </div>
      {generation ? (
        <div className="space-y-4">
          <StatusRow label="Workflow" value={reviewWorkflow.replace("_", " ")} />
          <StatusRow label="Generation" value={generation.status} />
          <StatusRow label="Suggested brand" value={generation.output.brand} />
          <StatusRow label="Product type" value={generation.output.productType} />
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm font-bold">Safety guardrails</p>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li>No automatic product deletion.</li>
              <li>Snapshot captured before AI updates.</li>
              <li>Rollback route restores any saved revision.</li>
            </ul>
          </div>
        </div>
      ) : <EmptyPanel title="Select a draft" />}
    </section>
  );
}

function SuggestionPanel({ generation }: { generation: AIProductGenerationRecord | null }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-bold">AI Suggestions</h2>
          <p className="text-xs text-muted-foreground">Title, SEO, tags, category, and pricing recommendations.</p>
        </div>
        <Sparkles className="h-5 w-5 text-brand-700" />
      </div>
      <div className="space-y-3">
        {generation?.suggestions?.length ? generation.suggestions.map((suggestion) => (
          <div key={`${suggestion.type}-${suggestion.title}`} className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold">{suggestion.title}</p>
              <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-bold uppercase">{suggestion.impact}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{suggestion.recommendation}</p>
          </div>
        )) : <EmptyPanel title="No suggestions yet" />}
      </div>
    </section>
  );
}

function AnalyticsPanel({ generations }: { generations: AIProductGenerationRecord[] }) {
  const published = generations.filter((generation) => generation.status === "PUBLISHED").length;
  const avgSeo = generations.length
    ? Math.round(generations.reduce((sum, item) => sum + (item.qualityBreakdown?.seo || 0), 0) / generations.length)
    : 0;
  const avgConversion = generations.length
    ? Math.round(generations.reduce((sum, item) => sum + (item.qualityBreakdown?.conversionPotential || 0), 0) / generations.length)
    : 0;

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold">Analytics Panel</h2>
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="space-y-3">
        <Metric icon={Rocket} label="Published" value={published} tone="green" />
        <Metric icon={Search} label="Average SEO" value={`${avgSeo}/100`} tone="blue" />
        <Metric icon={Languages} label="Conversion Potential" value={`${avgConversion}/100`} tone="amber" />
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value, tone }: { icon: any; label: string; value: React.ReactNode; tone: "neutral" | "blue" | "amber" | "green" }) {
  const tones = {
    neutral: "bg-muted text-foreground",
    blue: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
  };
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-black">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border py-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  return (
    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-border bg-background text-xs font-black">
      {score}
    </div>
  );
}

function ImageStrip({ images, onRemove }: { images: string[]; onRemove: (image: string) => void }) {
  if (!images.length) return null;
  return (
    <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
      {images.map((image) => (
        <div key={image} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
          <Image src={image} alt="Uploaded product" fill className="object-cover" sizes="120px" />
          <button
            type="button"
            onClick={() => onRemove(image)}
            className="absolute right-1 top-1 rounded-md bg-black/70 px-2 py-1 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

function EmptyPanel({ title }: { title: string }) {
  return (
    <div className="flex min-h-[160px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center text-sm font-medium text-muted-foreground">
      {title}
    </div>
  );
}

function buildSku(title: string) {
  const base = title
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return `AI-${base || "PRODUCT"}`;
}

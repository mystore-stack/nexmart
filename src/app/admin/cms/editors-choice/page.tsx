"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  GripVertical,
  ImagePlus,
  Loader2,
  Save,
  Sparkles,
  Star,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { ProductSelector } from "@/components/admin/ProductSelector";
import {
  EDITORS_CHOICE_COLLECTION_URL,
  EDITORS_CHOICE_DEFAULTS,
  EDITORS_CHOICE_SECTION_KEY,
  EditorsChoiceSectionData,
  calculateDiscount,
  deriveBrandLabel,
  getEditorsChoiceImage,
} from "@/lib/editors-choice";

interface SelectorProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  comparePrice?: number;
  stock: number;
  images: string[];
  tags?: string[];
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface SelectedProduct {
  id: string;
  order: number;
  customPrice?: number;
  customBadge?: string;
  active: boolean;
  product: SelectorProduct;
}

type SectionFormState = {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  bannerImage: string;
  viewAllButton: string;
  destinationUrl: string;
  active: boolean;
  maxProducts: number;
  hideIfEmpty: boolean;
};

const DEFAULT_FORM: SectionFormState = {
  title: EDITORS_CHOICE_DEFAULTS.title,
  subtitle: EDITORS_CHOICE_DEFAULTS.subtitle,
  description:
    "Luxury lifestyle curation with premium electronics, elevated essentials, and an editorial marketplace feel.",
  bannerImage: EDITORS_CHOICE_DEFAULTS.bannerImage,
  viewAllButton: EDITORS_CHOICE_DEFAULTS.viewAllButton,
  destinationUrl: EDITORS_CHOICE_COLLECTION_URL,
  active: true,
  maxProducts: EDITORS_CHOICE_DEFAULTS.maxProducts,
  hideIfEmpty: false,
};

export default function AdminEditorsChoicePage() {
  const [section, setSection] = useState<EditorsChoiceSectionData | null>(null);
  const [formData, setFormData] = useState<SectionFormState>(DEFAULT_FORM);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchSection = async () => {
    const sectionsRes = await fetch("/api/admin/cms/homepage-sections");
    const sectionsPayload = await sectionsRes.json();

    if (!sectionsPayload.success) {
      throw new Error("Failed to load homepage sections");
    }

    let foundSection = sectionsPayload.data?.find(
      (item: EditorsChoiceSectionData) => item.sectionKey === EDITORS_CHOICE_SECTION_KEY
    );

    if (!foundSection) {
      const createRes = await fetch("/api/admin/cms/homepage-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionKey: EDITORS_CHOICE_SECTION_KEY,
          ...DEFAULT_FORM,
          order: 3,
          displayOrder: 3,
        }),
      });

      const createPayload = await createRes.json();
      if (!createPayload.success) {
        throw new Error(createPayload.error || "Failed to initialize Editor's Choice");
      }

      foundSection = createPayload.data;
    }

    setSection(foundSection);
    setFormData({
      id: foundSection.id,
      title: foundSection.title || DEFAULT_FORM.title,
      subtitle: foundSection.subtitle || DEFAULT_FORM.subtitle,
      description: foundSection.description || DEFAULT_FORM.description,
      bannerImage: foundSection.bannerImage || DEFAULT_FORM.bannerImage,
      viewAllButton: foundSection.viewAllButton || DEFAULT_FORM.viewAllButton,
      destinationUrl: foundSection.destinationUrl || DEFAULT_FORM.destinationUrl,
      active: foundSection.active ?? DEFAULT_FORM.active,
      maxProducts: foundSection.maxProducts || DEFAULT_FORM.maxProducts,
      hideIfEmpty: foundSection.hideIfEmpty ?? DEFAULT_FORM.hideIfEmpty,
    });
  };

  const fetchSectionProducts = async () => {
    const productsRes = await fetch(`/api/admin/cms/homepage-sections/${EDITORS_CHOICE_SECTION_KEY}/products`);
    const productsPayload = await productsRes.json();

    if (productsPayload.success) {
      setSelectedProducts(productsPayload.data || []);
    }
  };

  useEffect(() => {
    Promise.all([fetchSection(), fetchSectionProducts()])
      .catch((error) => {
        console.error(error);
        toast.error("Unable to load Editor's Choice settings");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFieldChange = <K extends keyof SectionFormState>(key: K, value: SectionFormState[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "nexmart/homepage");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const payload = await res.json();

      if (!res.ok || !payload.success) {
        throw new Error(payload.error || "Upload failed");
      }

      setFormData((prev) => ({ ...prev, bannerImage: payload.data?.url || payload.url }));
      toast.success("Banner uploaded");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload banner");
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleSave = async () => {
    if (!section?.id) {
      toast.error("Section is not ready yet");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms/homepage-sections", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: section.id,
          ...formData,
        }),
      });

      const payload = await res.json();

      if (!payload.success) {
        throw new Error(payload.error || "Save failed");
      }

      setSection(payload.data || payload);
      toast.success("Editor's Choice updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const previewProducts = useMemo(
    () => selectedProducts.slice(0, Math.max(1, formData.maxProducts || EDITORS_CHOICE_DEFAULTS.maxProducts)),
    [formData.maxProducts, selectedProducts]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/cms" className="btn-ghost rounded-xl border border-border p-2">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
              <Sparkles className="h-6 w-6 text-amber-500" />
              Editor&apos;s Choice Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Curate the homepage luxury showcase, control visibility, and manage the collection destination.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={EDITORS_CHOICE_COLLECTION_URL}
            target="_blank"
            className="btn-outline inline-flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Eye className="h-4 w-4" />
            Open Collection
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || saving}
            className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[2rem] border border-border bg-card p-12 text-center shadow-sm">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand-700" />
          <p className="mt-4 text-sm font-medium text-muted-foreground">Loading Editor&apos;s Choice settings...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-6 rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between rounded-[1.5rem] border border-border bg-surface/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-foreground text-white">
                    {formData.active ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Show / Hide Section</p>
                    <p className="text-sm text-muted-foreground">Control whether Editor&apos;s Choice appears on the homepage.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleFieldChange("active", !formData.active)}
                  className={`h-7 w-14 rounded-full transition-colors ${
                    formData.active ? "bg-foreground" : "bg-muted"
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-full bg-white transition-transform ${
                      formData.active ? "translate-x-7" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Section Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFieldChange("title", e.target.value)}
                    className="input w-full"
                    placeholder={EDITORS_CHOICE_DEFAULTS.title}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Section Subtitle</label>
                  <textarea
                    value={formData.subtitle}
                    onChange={(e) => handleFieldChange("subtitle", e.target.value)}
                    rows={3}
                    className="input min-h-[88px] w-full"
                    placeholder={EDITORS_CHOICE_DEFAULTS.subtitle}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Banner Supporting Copy</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleFieldChange("description", e.target.value)}
                    rows={3}
                    className="input min-h-[96px] w-full"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">View All Label</label>
                    <input
                      type="text"
                      value={formData.viewAllButton}
                      onChange={(e) => handleFieldChange("viewAllButton", e.target.value)}
                      className="input w-full"
                      placeholder={EDITORS_CHOICE_DEFAULTS.viewAllButton}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Maximum Products</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={formData.maxProducts}
                      onChange={(e) => handleFieldChange("maxProducts", parseInt(e.target.value || "1", 10))}
                      className="input w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-foreground">Collection URL</label>
                  <input
                    type="text"
                    value={formData.destinationUrl}
                    onChange={(e) => handleFieldChange("destinationUrl", e.target.value)}
                    className="input w-full"
                    placeholder={EDITORS_CHOICE_COLLECTION_URL}
                  />
                </div>

                <div className="rounded-[1.5rem] border border-dashed border-border bg-surface/50 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">Upload Banner</p>
                      <p className="text-sm text-muted-foreground">Use the generated luxury banner or upload a custom image.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="btn-outline inline-flex items-center gap-2 px-4 py-2 text-sm"
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      Upload Banner
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    className="hidden"
                    onChange={handleBannerUpload}
                  />

                  <div className="grid gap-4 md:grid-cols-[160px_minmax(0,1fr)]">
                    <div className="relative overflow-hidden rounded-[1.25rem] border border-border bg-white">
                      <div className="relative h-32 w-full">
                        <Image
                          src={formData.bannerImage || EDITORS_CHOICE_DEFAULTS.bannerImage}
                          alt="Editor's Choice banner preview"
                          fill
                          sizes="160px"
                          className="object-cover"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-foreground">Banner URL</label>
                      <div className="relative">
                        <ImagePlus className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          value={formData.bannerImage}
                          onChange={(e) => handleFieldChange("bannerImage", e.target.value)}
                          className="input w-full pl-10"
                          placeholder={EDITORS_CHOICE_DEFAULTS.bannerImage}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-[1.5rem] border border-border bg-surface/60 p-4">
                  <div>
                    <p className="font-semibold text-foreground">Hide If Empty</p>
                    <p className="text-sm text-muted-foreground">Automatically hide the section if no products are selected.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFieldChange("hideIfEmpty", !formData.hideIfEmpty)}
                    className={`h-7 w-14 rounded-full transition-colors ${
                      formData.hideIfEmpty ? "bg-foreground" : "bg-muted"
                    }`}
                  >
                    <div
                      className={`h-6 w-6 rounded-full bg-white transition-transform ${
                        formData.hideIfEmpty ? "translate-x-7" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Preview Changes</h2>
                  <p className="text-sm text-muted-foreground">Figma-quality preview of the homepage section before publishing.</p>
                </div>
                <Link
                  href="/"
                  target="_blank"
                  className="btn-outline inline-flex items-center gap-2 px-4 py-2 text-sm"
                >
                  <Eye className="h-4 w-4" />
                  Preview Homepage
                </Link>
              </div>

              <div className="overflow-hidden rounded-[1.75rem] border border-border bg-background p-4">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-700">
                      <Sparkles className="h-3.5 w-3.5" />
                      Curated Luxury Picks
                    </span>
                    <h3 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{formData.title}</h3>
                    <p className="mt-1 max-w-xl text-sm text-muted-foreground">{formData.subtitle}</p>
                  </div>
                  <div className="hidden items-center gap-2 text-sm font-medium text-foreground md:flex">
                    {formData.viewAllButton}
                    <GripVertical className="h-4 w-4 rotate-90 text-muted-foreground" />
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.4fr)]">
                  <div className="overflow-hidden rounded-[1.75rem] border border-amber-100 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(250,245,235,0.95)_42%,_rgba(242,232,215,0.95)_100%)] p-5">
                    <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                      <Sparkles className="h-3 w-3" />
                      {EDITORS_CHOICE_DEFAULTS.bannerBadge}
                    </span>
                    <h4 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                      A premium edit for elevated everyday shopping.
                    </h4>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{formData.description}</p>
                    <div className="mt-5 inline-flex h-11 items-center rounded-2xl bg-foreground px-4 text-sm font-semibold text-white">
                      {EDITORS_CHOICE_DEFAULTS.ctaText}
                    </div>
                    <div className="relative mt-6 h-60 overflow-hidden rounded-[1.4rem] border border-white/70 bg-white">
                      <Image
                        src={formData.bannerImage || EDITORS_CHOICE_DEFAULTS.bannerImage}
                        alt="Editor's Choice preview banner"
                        fill
                        sizes="(max-width: 1280px) 100vw, 36vw"
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {previewProducts.length > 0 ? (
                      previewProducts.map((item, index) => {
                        const product = {
                          ...item.product,
                          price: item.customPrice || item.product.price,
                          customBadge: item.customBadge,
                        };
                        const discount = calculateDiscount({
                          price: product.price,
                          comparePrice: item.product.comparePrice,
                        });

                        return (
                          <div
                            key={item.id}
                            className="rounded-[1.4rem] border border-border bg-white p-3 shadow-sm"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {discount > 0 && (
                                  <span className="rounded-full bg-foreground px-2 py-1 text-[10px] font-bold text-white">
                                    -{discount}%
                                  </span>
                                )}
                                {item.customBadge && (
                                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                                    {item.customBadge}
                                  </span>
                                )}
                              </div>
                              <div className="grid h-8 w-8 place-items-center rounded-full border border-border bg-white">
                                <Star className="h-3.5 w-3.5 text-amber-500" />
                              </div>
                            </div>

                            <div className="relative mb-3 h-32 overflow-hidden rounded-[1.1rem] bg-surface/60">
                              <Image
                                src={getEditorsChoiceImage(
                                  {
                                    images: item.product.images,
                                    name: item.product.name,
                                  },
                                  index
                                )}
                                alt={item.product.name}
                                fill
                                sizes="220px"
                                className="object-contain p-3"
                              />
                            </div>

                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                              {deriveBrandLabel({
                                tags: item.product.tags || [],
                                category: item.product.category,
                              })}
                            </p>
                            <p className="mt-1 line-clamp-2 text-sm font-semibold text-foreground">{item.product.name}</p>
                            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span>Premium preview</span>
                            </div>
                            <div className="mt-3 flex items-end gap-2">
                              <span className="text-base font-semibold text-foreground">
                                {product.price.toLocaleString("fr-MA")} DH
                              </span>
                              {item.product.comparePrice && item.product.comparePrice > product.price && (
                                <span className="text-xs text-muted-foreground line-through">
                                  {item.product.comparePrice.toLocaleString("fr-MA")} DH
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-full rounded-[1.4rem] border border-dashed border-border bg-surface/40 px-6 py-12 text-center">
                        <Sparkles className="mx-auto h-10 w-10 text-muted-foreground/60" />
                        <p className="mt-4 text-sm font-medium text-foreground">No products selected yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Search products below, multi-select them, and drag to reorder the final layout.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ProductSelector
            sectionKey={EDITORS_CHOICE_SECTION_KEY}
            maxProducts={formData.maxProducts}
            initialProducts={selectedProducts}
            onSelectionChange={setSelectedProducts}
          />
        </>
      )}
    </div>
  );
}

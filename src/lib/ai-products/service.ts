import crypto from "crypto";
import slugify from "slugify";
import { analyzeProduct as analyzeGeminiProduct, isGeminiConfigured } from "@/lib/ai/gemini";
import type {
  AIProductImageAnalysis,
  AIProductInput,
  AIProductOutput,
  AIProductQualityScore,
  AIProductSuggestion,
  ProductCategoryOption,
} from "@/types/ai-products";

export function isAIProductManagerConfigured() {
  return isGeminiConfigured();
}

export async function generateAIProduct(
  input: AIProductInput,
  categories: ProductCategoryOption[]
): Promise<AIProductOutput> {
  const fallback = buildFallbackProduct(input, categories, []);
  if (!isGeminiConfigured()) return fallback;

  try {
    const analysis = await analyzeGeminiProduct({
      productName: input.productName,
      supplierInfo: input.supplierInfo,
      productUrl: input.productUrl,
      imageUrls: input.imageUrls,
      categories,
    });
    const parsed = geminiAnalysisToProductOutput(analysis, fallback);
    return normalizeProductOutput(parsed, input, categories);
  } catch (error) {
    console.error("[Gemini Product Manager] generation fallback:", safeError(error));
    return fallback;
  }
}

export async function analyzeProductImages(
  imageUrls: string[],
  productName?: string
): Promise<AIProductImageAnalysis[]> {
  const fallback = imageUrls.map((imageUrl) => fallbackImageAnalysis(imageUrl, productName));
  if (!isGeminiConfigured()) return fallback;

  try {
    const analysis = await analyzeGeminiProduct({
      productName,
      imageUrls,
      categories: [],
    });
    const parsed = { imageAnalysis: Array.isArray(analysis.imageAnalysis) ? analysis.imageAnalysis : fallback };

    return imageUrls.map((imageUrl, index) => ({
      ...fallback[index],
      ...(parsed.imageAnalysis?.[index] || {}),
      imageUrl,
    }));
  } catch (error) {
    console.error("[Gemini Product Manager] image analysis fallback:", safeError(error));
    return fallback;
  }
}

export function buildQualityScore(output: Pick<AIProductOutput, "title" | "longDescription" | "seo" | "tags" | "highlights" | "specifications">): AIProductQualityScore {
  const seo = clampScore(
    (output.seo?.seoTitle?.length >= 35 && output.seo?.seoTitle?.length <= 65 ? 25 : 14) +
      (output.seo?.seoDescription?.length >= 120 && output.seo?.seoDescription?.length <= 165 ? 25 : 14) +
      (output.seo?.metaKeywords?.length >= 5 ? 25 : 12) +
      (output.seo?.slug ? 25 : 10)
  );
  const contentQuality = clampScore(
    Math.min(40, output.longDescription.length / 12) +
      Math.min(25, output.highlights.length * 5) +
      Math.min(25, output.specifications.length * 5) +
      (output.title.length >= 8 ? 10 : 0)
  );
  const readability = clampScore(output.longDescription.length > 900 ? 78 : output.longDescription.length > 250 ? 92 : 70);
  const conversionPotential = clampScore(
    Math.min(35, output.highlights.length * 7) +
      Math.min(30, output.tags.length * 4) +
      Math.min(25, output.specifications.length * 4) +
      10
  );
  const overall = Math.round((seo + contentQuality + readability + conversionPotential) / 4);
  const notes = [
    seo < 80 ? "Tighten metadata length and keyword coverage." : "SEO metadata is ready for review.",
    contentQuality < 80 ? "Add richer highlights, specifications, or product proof points." : "Content depth is strong.",
    conversionPotential < 80 ? "Add clearer benefits, use cases, and pricing rationale." : "Conversion copy has clear benefit framing.",
  ];

  return { overall, seo, contentQuality, readability, conversionPotential, notes };
}

export function buildProductDescription(output: AIProductOutput) {
  const specs = output.specifications.map((item) => `- ${item.name}: ${item.value}`).join("\n");
  const highlights = output.highlights.map((item) => `- ${item}`).join("\n");
  const faq = output.faq.map((item) => `Q: ${item.question}\nA: ${item.answer}`).join("\n\n");

  return [
    output.shortDescription,
    output.longDescription,
    highlights ? `Highlights\n${highlights}` : "",
    specs ? `Specifications\n${specs}` : "",
    faq ? `FAQ\n${faq}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function productSnapshot(product: any) {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    comparePrice: product.comparePrice,
    cost: product.cost,
    categoryId: product.categoryId,
    images: product.images,
    tags: product.tags,
    sku: product.sku,
    stock: product.stock,
    lowStockAt: product.lowStockAt,
    weight: product.weight,
    published: product.published,
    featured: product.featured,
  };
}

export function parseCsvProducts(csv: string) {
  const rows = parseCsv(csv).filter((row) => row.some(Boolean));
  const [header = [], ...body] = rows;
  const keys = header.map((item) => item.trim().toLowerCase());

  return body.map((row) => {
    const record: Record<string, string> = {};
    keys.forEach((key, index) => {
      record[key] = row[index]?.trim() || "";
    });
    return {
      productName: record.name || record.title || record["product name"],
      supplierInfo: record.description || record.supplier_info || record["supplier info"],
      productUrl: record.url || record.product_url || record["product url"],
      imageUrls: (record.images || record.image || "")
        .split(/[|;]/)
        .map((item) => item.trim())
        .filter(Boolean),
    } satisfies AIProductInput;
  });
}

export function toSlug(title: string) {
  const slug = slugify(title || "product", { lower: true, strict: true }).slice(0, 90);
  return slug || `product-${crypto.randomBytes(4).toString("hex")}`;
}

export async function ensureUniqueProductSlug(prisma: any, organizationId: string, title: string, productId?: string) {
  const base = toSlug(title);
  let slug = base;
  let suffix = 2;

  while (
    await prisma.product.findFirst({
      where: {
        organizationId,
        slug,
        ...(productId ? { NOT: { id: productId } } : {}),
      },
      select: { id: true },
    })
  ) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function ensureUniqueSku(prisma: any, organizationId: string, sku: string, productId?: string) {
  const clean = sku.trim() || `AI-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  let candidate = clean;
  let suffix = 2;

  while (
    await prisma.product.findFirst({
      where: {
        organizationId,
        sku: candidate,
        ...(productId ? { NOT: { id: productId } } : {}),
      },
      select: { id: true },
    })
  ) {
    candidate = `${clean}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function geminiAnalysisToProductOutput(analysis: any, fallback: AIProductOutput): AIProductOutput {
  const title = analysis.title || analysis.suggestedTitle || fallback.title;
  const shortDescription = analysis.shortDescription || analysis.description || fallback.shortDescription;
  const longDescription = analysis.longDescription || analysis.description || fallback.longDescription;
  const tags = Array.isArray(analysis.tags) ? analysis.tags : fallback.tags;

  return {
    ...fallback,
    title,
    shortDescription,
    longDescription,
    seo: {
      ...fallback.seo,
      seoTitle: analysis.seoTitle || analysis.seo?.seoTitle || fallback.seo.seoTitle,
      seoDescription: analysis.seoDescription || analysis.seo?.seoDescription || fallback.seo.seoDescription,
      metaKeywords: analysis.metaKeywords || analysis.seo?.metaKeywords || tags,
      openGraphTitle: analysis.openGraphTitle || analysis.seo?.openGraphTitle || title,
      openGraphDescription: analysis.openGraphDescription || analysis.seo?.openGraphDescription || shortDescription,
      slug: analysis.slug || analysis.seo?.slug || fallback.seo.slug,
    },
    tags,
    highlights: analysis.highlights || fallback.highlights,
    specifications: analysis.specifications || fallback.specifications,
    category: analysis.category || fallback.category,
    subcategory: analysis.subcategory || fallback.subcategory,
    brand: analysis.brand || fallback.brand,
    productType: analysis.productType || fallback.productType,
    imageAnalysis: Array.isArray(analysis.imageAnalysis) ? analysis.imageAnalysis : fallback.imageAnalysis,
    translations: analysis.translations || fallback.translations,
    suggestions: analysis.suggestions || fallback.suggestions,
    faq: analysis.faq || fallback.faq,
    marketingCopy: analysis.marketingCopy || shortDescription,
    pricingStrategy: analysis.pricingStrategy || fallback.pricingStrategy,
  };
}

function normalizeProductOutput(
  output: AIProductOutput,
  input: AIProductInput,
  categories: ProductCategoryOption[]
): AIProductOutput {
  const title = output.title || input.productName || "NexMart Product";
  const seo = {
    ...output.seo,
    seoTitle: (output.seo?.seoTitle || title).slice(0, 70),
    seoDescription: (output.seo?.seoDescription || output.shortDescription || title).slice(0, 170),
    openGraphTitle: output.seo?.openGraphTitle || output.seo?.seoTitle || title,
    openGraphDescription: output.seo?.openGraphDescription || output.seo?.seoDescription || output.shortDescription || title,
    metaKeywords: dedupe(output.seo?.metaKeywords || output.tags || []),
    slug: output.seo?.slug || toSlug(title),
  };
  const qualityScore = buildQualityScore({ ...output, title, seo });
  const category = output.category || categories[0]?.name || "General";

  return {
    ...output,
    title,
    shortDescription: output.shortDescription || title,
    longDescription: output.longDescription || output.shortDescription || title,
    seo,
    tags: dedupe(output.tags || seo.metaKeywords || []),
    highlights: output.highlights || [],
    specifications: output.specifications || [],
    category,
    subcategory: output.subcategory || category,
    brand: output.brand || "NexMart",
    productType: output.productType || "Product",
    imageAnalysis: output.imageAnalysis || [],
    translations: output.translations || fallbackTranslations(title, output.shortDescription || title, output.longDescription || title, output.highlights || []),
    qualityScore,
    suggestions: output.suggestions || fallbackSuggestions(title),
    faq: output.faq || [],
    marketingCopy: output.marketingCopy || output.shortDescription || title,
    pricingStrategy: output.pricingStrategy || "Position pricing against landed cost, perceived quality, competitor range, and margin targets.",
  };
}

function buildFallbackProduct(
  input: AIProductInput,
  categories: ProductCategoryOption[],
  imageAnalysis: AIProductImageAnalysis[]
): AIProductOutput {
  const rawTitle = input.productName || inferTitle(input.supplierInfo) || "New NexMart Product";
  const title = rawTitle.trim().slice(0, 120);
  const category = categories[0]?.name || "General";
  const keywords = dedupe([category, "premium", "NexMart", ...title.split(/\s+/).filter((word) => word.length > 3)]).slice(0, 10);
  const shortDescription =
    input.supplierInfo?.slice(0, 150) ||
    `${title} selected for NexMart customers with reliable quality, clear value, and fast merchandising readiness.`;
  const longDescription =
    input.supplierInfo ||
    `${title} is prepared for a premium ecommerce listing with customer-focused benefits, clear product details, and SEO-ready content. Review supplier details, pricing, and imagery before publishing.`;
  const seo = {
    seoTitle: `${title} | NexMart`.slice(0, 65),
    seoDescription: shortDescription.slice(0, 160),
    metaKeywords: keywords,
    openGraphTitle: title,
    openGraphDescription: shortDescription.slice(0, 160),
    slug: toSlug(title),
  };
  const highlights = ["SEO-ready listing copy", "Customer-focused benefits", "Reviewable AI merchandising draft"];
  const output: AIProductOutput = {
    title,
    shortDescription,
    longDescription,
    seo,
    tags: keywords,
    highlights,
    specifications: [
      { name: "Brand", value: "NexMart" },
      { name: "Merchandising status", value: "AI draft" },
    ],
    category,
    subcategory: category,
    brand: "NexMart",
    productType: imageAnalysis[0]?.productType || "Product",
    imageAnalysis,
    translations: fallbackTranslations(title, shortDescription, longDescription, highlights),
    qualityScore: { overall: 0, seo: 0, contentQuality: 0, readability: 0, conversionPotential: 0, notes: [] },
    suggestions: fallbackSuggestions(title),
    faq: [
      {
        question: `What makes ${title} a good choice?`,
        answer: "It combines practical product value with a listing that is ready for review, SEO improvement, and conversion-focused merchandising.",
      },
    ],
    marketingCopy: `${title} gives customers a clear reason to buy with practical benefits and premium presentation.`,
    pricingStrategy: "Start from supplier landed cost, target margin, competitor benchmarks, and perceived product quality.",
  };
  output.qualityScore = buildQualityScore(output);
  return output;
}

function fallbackImageAnalysis(imageUrl: string, productName?: string): AIProductImageAnalysis {
  return {
    imageUrl,
    productType: productName || "Product",
    colors: ["neutral"],
    features: ["product image available"],
    useCases: ["ecommerce product page"],
    altText: `${productName || "Product"} image for NexMart product listing`,
    confidence: 0.45,
  };
}

function fallbackTranslations(title: string, shortDescription: string, longDescription: string, highlights: string[]) {
  return {
    fr: { title, shortDescription, longDescription, highlights },
    en: { title, shortDescription, longDescription, highlights },
    ar: { title, shortDescription, longDescription, highlights },
  };
}

function fallbackSuggestions(title: string): AIProductSuggestion[] {
  return [
    {
      type: "title",
      title: "Tighten product naming",
      recommendation: `Keep "${title}" benefit-led and under 70 characters for collection pages.`,
      impact: "medium",
    },
    {
      type: "pricing",
      title: "Validate pricing before publishing",
      recommendation: "Compare supplier cost, competitor range, delivery cost, and target gross margin.",
      impact: "high",
    },
  ];
}

function inferTitle(text?: string) {
  if (!text) return "";
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length >= 4 && line.length <= 120);
}

function parseCsv(csv: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    const next = csv[i + 1];

    if (char === '"' && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  rows.push(row);
  return rows;
}

function dedupe(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function safeError(error: unknown) {
  if (!(error instanceof Error)) return "Unknown Gemini product error";
  return { name: error.name, message: error.message.slice(0, 500) };
}

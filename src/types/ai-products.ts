export type AIProductWorkflow = "DRAFT" | "REVIEW_REQUIRED" | "AUTO_PUBLISH";

export type AIProductGenerationKind =
  | "CREATE"
  | "OPTIMIZE_EXISTING"
  | "IMAGE_ANALYSIS"
  | "BULK_IMPORT";

export type AIProductGenerationStatus =
  | "DRAFT"
  | "READY"
  | "REVIEW_REQUIRED"
  | "PUBLISHED"
  | "FAILED"
  | "ARCHIVED";

export interface ProductCategoryOption {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}

export interface AIProductImageAnalysis {
  imageUrl: string;
  productType: string;
  colors: string[];
  features: string[];
  useCases: string[];
  altText: string;
  confidence: number;
}

export interface AIProductTranslations {
  fr: {
    title: string;
    shortDescription: string;
    longDescription: string;
    highlights: string[];
  };
  en: {
    title: string;
    shortDescription: string;
    longDescription: string;
    highlights: string[];
  };
  ar: {
    title: string;
    shortDescription: string;
    longDescription: string;
    highlights: string[];
  };
}

export interface AIProductSEO {
  seoTitle: string;
  seoDescription: string;
  metaKeywords: string[];
  openGraphTitle: string;
  openGraphDescription: string;
  slug: string;
}

export interface AIProductQualityScore {
  overall: number;
  seo: number;
  contentQuality: number;
  readability: number;
  conversionPotential: number;
  notes: string[];
}

export interface AIProductSuggestion {
  type: "title" | "keywords" | "category" | "tags" | "pricing" | "content";
  title: string;
  recommendation: string;
  impact: "low" | "medium" | "high";
}

export interface AIProductSpecification {
  name: string;
  value: string;
}

export interface AIProductOutput {
  title: string;
  shortDescription: string;
  longDescription: string;
  seo: AIProductSEO;
  tags: string[];
  highlights: string[];
  specifications: AIProductSpecification[];
  category: string;
  subcategory: string;
  brand: string;
  productType: string;
  imageAnalysis: AIProductImageAnalysis[];
  translations: AIProductTranslations;
  qualityScore: AIProductQualityScore;
  suggestions: AIProductSuggestion[];
  faq: Array<{ question: string; answer: string }>;
  marketingCopy: string;
  pricingStrategy: string;
}

export interface AIProductInput {
  productName?: string;
  supplierInfo?: string;
  productUrl?: string;
  imageUrls?: string[];
  targetLanguage?: "fr" | "en" | "ar";
  tone?: "premium" | "technical" | "friendly" | "conversion";
}

export interface AIProductGenerationRecord {
  id: string;
  kind: AIProductGenerationKind;
  status: AIProductGenerationStatus;
  workflow: AIProductWorkflow;
  input: AIProductInput;
  output: AIProductOutput;
  imageAnalysis: AIProductImageAnalysis[];
  translations: AIProductTranslations;
  seo: AIProductSEO;
  qualityScore: number;
  qualityBreakdown: AIProductQualityScore;
  suggestions: AIProductSuggestion[];
  selectedCategoryId?: string | null;
  selectedBrand?: string | null;
  productType?: string | null;
  productId?: string | null;
  revisionNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AIProductPublishInput {
  generationId: string;
  productId?: string;
  workflow: AIProductWorkflow;
  categoryId: string;
  price: number;
  comparePrice?: number | null;
  cost?: number | null;
  sku: string;
  stock: number;
  lowStockAt: number;
  weight?: number | null;
  images: string[];
  tags: string[];
  title: string;
  description: string;
  featured: boolean;
  revisionNote?: string;
}

export interface AIProductManagerBootstrap {
  categories: ProductCategoryOption[];
  products: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    published: boolean;
    category?: { id: string; name: string } | null;
    images: string[];
  }>;
  generations: AIProductGenerationRecord[];
}

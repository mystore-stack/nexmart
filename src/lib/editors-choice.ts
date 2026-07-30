const IMAGE_BASE_URL = "https://coresg-normal.trae.ai/api/ide/v1/text_to_image";

function buildImageUrl(prompt: string, imageSize: string) {
  return `${IMAGE_BASE_URL}?prompt=${encodeURIComponent(prompt)}&image_size=${imageSize}`;
}

export const EDITORS_CHOICE_SECTION_KEY = "promotionalCards";
export const EDITORS_CHOICE_COLLECTION_URL = "/collections/editors-choice";

export const EDITORS_CHOICE_DEFAULTS = {
  title: "Editor's Choice",
  subtitle: "Hand-picked products selected by the NexMart team.",
  viewAllButton: "View All",
  ctaText: "Shop Collection",
  destinationUrl: EDITORS_CHOICE_COLLECTION_URL,
  maxProducts: 6,
  bannerBadge: "Editor's Pick",
  bannerImage: buildImageUrl(
    "luxury shopping scene featuring premium electronics on elegant white and soft gold styling, minimal background, soft shadows, refined studio lighting, high-end marketplace editorial banner, ultra realistic product photography",
    "landscape_16_9"
  ),
};

export const EDITORS_CHOICE_PRODUCT_ART = [
  {
    key: "smartphone",
    label: "Smartphone",
    image: buildImageUrl(
      "premium smartphone product photography, realistic studio shot, centered composition, white seamless background, soft shadow, polished aluminum edges, flagship electronics advertising, ultra detailed",
      "square_hd"
    ),
  },
  {
    key: "laptop",
    label: "Laptop",
    image: buildImageUrl(
      "premium laptop product photography, realistic studio shot, white seamless background, soft shadow, thin metallic body, clean luxury ecommerce aesthetic, ultra detailed",
      "square_hd"
    ),
  },
  {
    key: "smart-watch",
    label: "Smart Watch",
    image: buildImageUrl(
      "premium smart watch product photography, realistic studio shot, white seamless background, soft shadow, minimal luxury styling, crisp display, ultra detailed",
      "square_hd"
    ),
  },
  {
    key: "wireless-earbuds",
    label: "Wireless Earbuds",
    image: buildImageUrl(
      "premium wireless earbuds product photography, realistic studio shot, white seamless background, soft shadow, elegant charging case, luxury ecommerce aesthetic, ultra detailed",
      "square_hd"
    ),
  },
  {
    key: "gaming-headset",
    label: "Gaming Headset",
    image: buildImageUrl(
      "premium gaming headset product photography, realistic studio shot, white seamless background, soft shadow, modern matte finish, high-end ecommerce lighting, ultra detailed",
      "square_hd"
    ),
  },
  {
    key: "mechanical-keyboard",
    label: "Mechanical Keyboard",
    image: buildImageUrl(
      "premium mechanical keyboard product photography, realistic studio shot, white seamless background, soft shadow, refined keycaps, minimal luxury ecommerce aesthetic, ultra detailed",
      "square_hd"
    ),
  },
] as const;

export interface EditorsChoiceProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  comparePrice?: number | null;
  rating: number;
  reviewCount: number;
  images: string[];
  stock: number;
  soldCount: number;
  customBadge?: string | null;
  tags?: string[];
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface EditorsChoiceSectionData {
  id?: string;
  sectionKey?: string;
  title?: string;
  subtitle?: string | null;
  description?: string | null;
  bannerImage?: string | null;
  viewAllButton?: string | null;
  destinationUrl?: string | null;
  maxProducts?: number | null;
  hideIfEmpty?: boolean;
  active?: boolean;
}

export interface EditorsChoiceProductArt {
  key: string;
  label: string;
  image: string;
}

export interface EditorsChoiceDefaults {
  title: string;
  subtitle: string;
  viewAllButton: string;
  ctaText: string;
  destinationUrl: string;
  maxProducts: number;
  bannerBadge: string;
  bannerImage: string;
}

export interface EditorsChoiceSectionCopy {
  title: string;
  subtitle: string;
  viewAllButton: string;
  destinationUrl: string;
  bannerImage: string;
}

// Type guards for better type safety
export function isEditorsChoiceProduct(obj: any): obj is EditorsChoiceProduct {
  return (
    obj &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.slug === "string" &&
    typeof obj.price === "number"
  );
}

export function isEditorsChoiceSectionData(obj: any): obj is EditorsChoiceSectionData {
  return obj && typeof obj === "object";
}

const GENERIC_TAGS = new Set([
  "featured",
  "new",
  "sale",
  "deals",
  "recommended",
  "premium",
  "editors-choice",
  "editor's choice",
]);

function toTitleCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function deriveBrandLabel(product: Pick<EditorsChoiceProduct, "tags" | "category">) {
  const brandTag = product.tags?.find((tag) => !GENERIC_TAGS.has(tag.toLowerCase()));
  if (brandTag) return toTitleCase(brandTag);
  if (product.category?.name) return product.category.name;
  return "NexMart";
}

export function calculateDiscount(product: Pick<EditorsChoiceProduct, "price" | "comparePrice">) {
  if (product.comparePrice && product.comparePrice > product.price) {
    return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
  }

  return 0;
}

export function getEditorsChoiceImage(product: Pick<EditorsChoiceProduct, "images" | "name">, index: number) {
  const primaryImage = product.images?.[0];
  if (primaryImage) return primaryImage;

  const normalized = product.name.toLowerCase();
  const matched = EDITORS_CHOICE_PRODUCT_ART.find((item) => normalized.includes(item.key.replace(/-/g, " ")));
  if (matched) return matched.image;

  return EDITORS_CHOICE_PRODUCT_ART[index % EDITORS_CHOICE_PRODUCT_ART.length]?.image || EDITORS_CHOICE_DEFAULTS.bannerImage;
}

export function getEditorsChoiceSectionCopy(section?: EditorsChoiceSectionData | null) {
  return {
    title: section?.title || EDITORS_CHOICE_DEFAULTS.title,
    subtitle: section?.subtitle || EDITORS_CHOICE_DEFAULTS.subtitle,
    viewAllButton: section?.viewAllButton || EDITORS_CHOICE_DEFAULTS.viewAllButton,
    destinationUrl: section?.destinationUrl || EDITORS_CHOICE_DEFAULTS.destinationUrl,
    bannerImage: section?.bannerImage || EDITORS_CHOICE_DEFAULTS.bannerImage,
  };
}

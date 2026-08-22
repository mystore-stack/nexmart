export interface CmsSelectionItemLike {
  id?: string;
  productId?: string;
  product?: {
    id?: string;
  } | null;
}

export type CmsSelectionValue = Array<string | CmsSelectionItemLike | null | undefined> | null | undefined;

export function normalizeProductSelectionIds(value: CmsSelectionValue): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const ids = value.flatMap((entry) => {
    if (typeof entry === "string") {
      return entry.trim() ? [entry.trim()] : [];
    }

    if (!entry || typeof entry !== "object") {
      return [];
    }

    const id = extractProductSelectionId(entry);
    return id ? [id] : [];
  });

  return Array.from(new Set(ids));
}

export function extractProductSelectionId(item: CmsSelectionItemLike | null | undefined): string | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  // Prefer the actual product id when the selection entry wraps a section product.
  if (typeof item.product?.id === "string" && item.product.id.trim()) {
    return item.product.id.trim();
  }

  if (typeof item.productId === "string" && item.productId.trim()) {
    return item.productId.trim();
  }

  if (typeof item.id === "string" && item.id.trim()) {
    return item.id.trim();
  }

  return null;
}

export async function fetchProductsForSelectionIds(ids: string[]) {
  if (!ids.length) {
    return [];
  }

  const params = new URLSearchParams({
    ids: ids.join(","),
    limit: "100",
  });

  const response = await fetch(`/api/admin/cms/products/search?${params.toString()}`);
  if (!response.ok) {
    return [];
  }

  const payload = await response.json();
  const products = Array.isArray(payload?.products)
    ? payload.products
    : Array.isArray(payload?.data?.products)
      ? payload.data.products
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

  return products.filter((product: { id?: string }) => typeof product?.id === "string" && ids.includes(product.id));
}

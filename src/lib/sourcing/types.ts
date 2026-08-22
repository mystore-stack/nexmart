export interface ExternalProduct {
  source: string;
  externalProductId: string;
  externalUrl: string;
  supplierName: string;
  title: string;
  description: string;
  originalPrice: number;
  currency: string;
  images: string[];
  stock: number;
  rating?: number;
  categoryName?: string;
}

export interface SourcingProvider {
  name: string;
  fetchProduct: (urlOrId: string) => Promise<ExternalProduct | null>;
  searchProducts?: (query: string) => Promise<ExternalProduct[]>;
}

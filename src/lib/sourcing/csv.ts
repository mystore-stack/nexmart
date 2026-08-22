import { ExternalProduct, SourcingProvider } from "./types";

export class CsvProvider implements SourcingProvider {
  name = "CSV";

  async fetchProduct(urlOrId: string): Promise<ExternalProduct | null> {
    // CSV provider doesn't support individual product fetching
    throw new Error("CSV provider does not support individual product fetching. Use searchProducts instead.");
  }

  async searchProducts(query: string): Promise<ExternalProduct[]> {
    // CSV provider doesn't support search
    throw new Error("CSV provider does not support search. Use bulk import with CSV data instead.");
  }

  /**
   * Parse CSV data and return ExternalProduct array
   * Expected CSV format:
   * title,description,price,currency,images,stock,category,brand,externalProductId,externalUrl,supplierName
   */
  static parseCsvData(csvText: string): ExternalProduct[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return []; // Only header or empty

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const products: ExternalProduct[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle quoted values containing commas
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Validate required fields
      if (!row.title || !row.price || !row.externalproductid) {
        continue;
      }

      // Parse images (semicolon-separated URLs)
      const images = row.images 
        ? row.images.split(';').map((url: string) => url.trim()).filter(Boolean)
        : [];

      // Validate at least one image
      if (images.length === 0) {
        continue;
      }

      const product: ExternalProduct = {
        source: "CSV",
        externalProductId: row.externalproductid,
        externalUrl: row.externalurl || `https://nexmart.ma/product/${row.externalproductid}`,
        supplierName: row.suppliername || 'CSV Import',
        title: row.title,
        description: row.description || `Imported from CSV: ${row.title}`,
        originalPrice: parseFloat(row.price) || 0,
        currency: row.currency || 'USD',
        images,
        stock: parseInt(row.stock) || 0,
        categoryName: row.category,
      };

      // Optional fields
      if (row.brand) {
        // Brand could be added to description or tags if needed
        product.description += ` (Brand: ${row.brand})`;
      }

      products.push(product);
    }

    return products;
  }

  /**
   * Validate a single external product meets minimum requirements
   */
  static validateProduct(product: ExternalProduct): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!product.title || product.title.trim().length === 0) {
      errors.push('Missing product title');
    }

    if (!product.externalProductId || product.externalProductId.trim().length === 0) {
      errors.push('Missing external product ID');
    }

    if (!product.externalUrl || product.externalUrl.trim().length === 0) {
      errors.push('Missing external URL');
    }

    if (!product.images || product.images.length === 0) {
      errors.push('No product images');
    }

    if (!product.supplierName || product.supplierName.trim().length === 0) {
      errors.push('Missing supplier name');
    }

    if (product.originalPrice <= 0) {
      errors.push('Invalid price (must be greater than 0)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
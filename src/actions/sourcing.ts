"use server";

import { requireAdmin } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { AliExpressProvider } from "@/lib/sourcing/aliexpress";
import { DemoProvider } from "@/lib/sourcing/demo";
import { CsvProvider } from "@/lib/sourcing/csv";
import { ExternalProduct } from "@/lib/sourcing/types";
import { revalidatePath } from "next/cache";

export async function getSourcingModeAction() {
  await requireAdmin();
  
  const hasAliExpressKeys = !!(
    process.env.ALIEXPRESS_APP_KEY && 
    process.env.ALIEXPRESS_APP_SECRET && 
    process.env.ALIEXPRESS_ACCESS_TOKEN
  );

  if (hasAliExpressKeys) {
    return "LIVE";
  }
  
  // Return CONFIGURATION REQUIRED instead of DEMO
  return "CONFIGURATION_REQUIRED";
}

export async function searchDemoProductsAction(query: string) {
  await requireAdmin();
  const provider = new DemoProvider();
  return { success: true, data: await provider.searchProducts(query) };
}

export async function clearDemoDataAction() {
  try {
    const { organizationId } = await requireAdmin();
    
    await prisma.product.deleteMany({
      where: {
        organizationId,
        source: "DEMO"
      }
    });
    
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to clear demo data" };
  }
}

export async function fetchExternalProductAction(urlOrId: string, providerName: string) {
  try {
    await requireAdmin();

    let provider;
    if (providerName === "ALIEXPRESS") {
      provider = new AliExpressProvider();
    } else if (providerName === "DEMO") {
      provider = new DemoProvider();
    } else if (providerName === "CSV") {
      throw new Error("CSV provider does not support individual product fetching. Use bulk import instead.");
    } else {
      throw new Error("Provider not supported");
    }

    const product = await provider.fetchProduct(urlOrId);
    return { success: true, data: product };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch external product" };
  }
}

export async function importProductAction(data: {
  externalProduct: ExternalProduct;
  sellingPrice: number;
  costPrice: number;
  categoryId: string;
}) {
  try {
    const session = await requireAdmin();
    const { organizationId } = session;

    const { externalProduct, sellingPrice, costPrice, categoryId } = data;

    // Check for duplicates
    const existingProduct = await prisma.product.findFirst({
      where: {
        organizationId,
        source: externalProduct.source,
        externalProductId: externalProduct.externalProductId,
      },
      select: { id: true }
    });

    if (existingProduct) {
      return { success: false, error: "Product already exists in NexMart." };
    }

    // Generate slug
    const baseSlug = externalProduct.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.product.findFirst({ where: { organizationId, slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Generate SKU
    const sku = `IMP-${externalProduct.source.substring(0, 3)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const newProduct = await prisma.product.create({
      data: {
        organizationId,
        name: externalProduct.title,
        slug,
        description: externalProduct.description || "",
        price: sellingPrice,
        cost: costPrice,
        comparePrice: externalProduct.originalPrice > sellingPrice ? externalProduct.originalPrice : null,
        categoryId,
        images: externalProduct.images,
        tags: [],
        sku,
        stock: externalProduct.stock || 0,
        published: false, // Default to DRAFT
        isVisible: true,
        source: externalProduct.source,
        externalProductId: externalProduct.externalProductId,
        externalUrl: externalProduct.externalUrl,
        supplierName: externalProduct.supplierName,
        lastSyncedAt: new Date(),
      },
    });

    revalidatePath("/admin/products");
    return { success: true, data: newProduct };
  } catch (error: any) {
    console.error("Import error:", error);
    return { success: false, error: error.message || "Failed to import product." };
  }
}

export async function syncProductAction(productId: string) {
  try {
    const session = await requireAdmin();
    const { organizationId } = session;

    const product = await prisma.product.findFirst({
      where: { id: productId, organizationId, source: { not: null } },
    });

    if (!product || !product.source || !product.externalProductId) {
      return { success: false, error: "Product is not linked to an external source." };
    }

    let provider;
    if (product.source === "ALIEXPRESS") {
      provider = new AliExpressProvider();
    } else if (product.source === "DEMO") {
      provider = new DemoProvider();
    } else if (product.source === "CSV") {
      return { success: false, error: "CSV products cannot be synced. Re-import from updated CSV file." };
    } else {
      return { success: false, error: "Provider not supported for sync." };
    }

    const externalProduct = await provider.fetchProduct(product.externalProductId);
    if (!externalProduct) {
      return { success: false, error: "Product no longer exists at source." };
    }

    // IMPORTANT: Sync stock and supplier cost, but DO NOT overwrite selling price
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: externalProduct.stock ?? product.stock,
        cost: externalProduct.originalPrice ?? product.cost,
        lastSyncedAt: new Date(),
        // We do NOT update `price` (NexMart selling price)
      },
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to sync product." };
  }
}

export async function bulkImportProductsAction(data: {
  items: {
    externalProduct: ExternalProduct;
    categoryId: string;
    sellingPrice: number;
    costPrice: number;
  }[];
}) {
  try {
    const session = await requireAdmin();
    const { organizationId } = session;

    let validCount = 0;
    let invalidCount = 0;

    for (const item of data.items) {
      const { externalProduct, categoryId, sellingPrice, costPrice } = item;
      try {
        // Validate before import
        if (!externalProduct.title || !externalProduct.externalProductId || !externalProduct.source) {
          invalidCount++;
          continue;
        }

        // Duplicate check
        const existingProduct = await prisma.product.findFirst({
          where: {
            organizationId,
            source: externalProduct.source,
            externalProductId: externalProduct.externalProductId,
          },
        });

        if (existingProduct) {
          invalidCount++;
          continue;
        }

        const baseSlug = externalProduct.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
        let slug = baseSlug;
        let counter = 1;
        while (await prisma.product.findFirst({ where: { organizationId, slug } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }

        const sku = `IMP-${externalProduct.source.substring(0, 3)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        await prisma.product.create({
          data: {
            organizationId,
            name: externalProduct.title,
            slug,
            description: externalProduct.description || "",
            price: sellingPrice,
            cost: costPrice,
            comparePrice: externalProduct.originalPrice > sellingPrice ? externalProduct.originalPrice : null,
            categoryId: categoryId,
            images: externalProduct.images,
            tags: [],
            sku,
            stock: externalProduct.stock || 0,
            published: false,
            isVisible: true,
            source: externalProduct.source,
            externalProductId: externalProduct.externalProductId,
            externalUrl: externalProduct.externalUrl,
            supplierName: externalProduct.supplierName,
            lastSyncedAt: new Date(),
          },
        });
        validCount++;
      } catch (e) {
        invalidCount++;
      }
    }

    revalidatePath("/admin/products");
    return { success: true, data: { valid: validCount, invalid: invalidCount } };
  } catch (error: any) {
    return { success: false, error: error.message || "Bulk import failed." };
  }
}

/**
 * Bulk import from CSV with batching and detailed reporting
 * Processes products in batches of 100 to avoid overwhelming the server
 */
export async function bulkImportCsvAction(data: {
  csvData: string;
  categoryId: string;
  defaultMargin?: number; // Default profit margin (e.g., 0.5 for 50%)
}) {
  try {
    const session = await requireAdmin();
    const { organizationId } = session;
    const { csvData, categoryId, defaultMargin = 0.5 } = data;

    // Parse CSV data
    const externalProducts = CsvProvider.parseCsvData(csvData);
    
    if (externalProducts.length === 0) {
      return { 
        success: false, 
        error: "No valid products found in CSV data. Ensure CSV has proper headers and data." 
      };
    }

    // Validate all products first
    const validationResults = externalProducts.map(p => CsvProvider.validateProduct(p));
    const validProducts = externalProducts.filter((_, i) => validationResults[i].valid);
    const invalidProducts = externalProducts.filter((_, i) => !validationResults[i].valid);

    // Batch processing (100 products per batch)
    const BATCH_SIZE = 100;
    let importedCount = 0;
    let duplicateCount = 0;
    let invalidCount = invalidProducts.length;
    let outOfStockCount = 0;
    let noImageCount = 0;

    // Process in batches
    for (let i = 0; i < validProducts.length; i += BATCH_SIZE) {
      const batch = validProducts.slice(i, i + BATCH_SIZE);
      
      for (const externalProduct of batch) {
        try {
          // Check for duplicates using organizationId + source + externalProductId
          const existingProduct = await prisma.product.findFirst({
            where: {
              organizationId,
              source: externalProduct.source,
              externalProductId: externalProduct.externalProductId,
            },
          });

          if (existingProduct) {
            duplicateCount++;
            continue;
          }

          // Skip out of stock products
          if (externalProduct.stock === 0) {
            outOfStockCount++;
            continue;
          }

          // Generate unique slug
          const baseSlug = externalProduct.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
          let slug = baseSlug;
          let counter = 1;
          while (await prisma.product.findFirst({ where: { organizationId, slug } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
          }

          // Generate SKU
          const sku = `IMP-${externalProduct.source.substring(0, 3)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

          // Calculate pricing
          const costPrice = externalProduct.originalPrice;
          const sellingPrice = costPrice * (1 + defaultMargin);

          await prisma.product.create({
            data: {
              organizationId,
              name: externalProduct.title,
              slug,
              description: externalProduct.description || "",
              price: sellingPrice,
              cost: costPrice,
              comparePrice: externalProduct.originalPrice > sellingPrice ? externalProduct.originalPrice : null,
              categoryId: categoryId,
              images: externalProduct.images,
              tags: [],
              sku,
              stock: externalProduct.stock || 0,
              published: false, // ALL imported products are DRAFTS
              isVisible: true,
              source: externalProduct.source,
              externalProductId: externalProduct.externalProductId,
              externalUrl: externalProduct.externalUrl,
              supplierName: externalProduct.supplierName,
              lastSyncedAt: new Date(),
            },
          });

          importedCount++;
        } catch (e) {
          invalidCount++;
        }
      }
    }

    revalidatePath("/admin/products");
    
    return {
      success: true,
      data: {
        imported: importedCount,
        duplicates: duplicateCount,
        invalid: invalidCount,
        outOfStock: outOfStockCount,
        noImage: noImageCount,
        totalFound: externalProducts.length,
        source: "CSV",
        areDrafts: true,
      }
    };
  } catch (error: any) {
    console.error("CSV Import error:", error);
    return { success: false, error: error.message || "CSV bulk import failed." };
  }
}

/**
 * Map products to categories based on category name
 */
export async function mapProductsToCategoryAction(data: {
  productIds: string[];
  categoryId: string;
}) {
  try {
    const session = await requireAdmin();
    const { organizationId } = session;

    const result = await prisma.product.updateMany({
      where: {
        id: { in: data.productIds },
        organizationId,
      },
      data: {
        categoryId: data.categoryId,
      },
    });

    revalidatePath("/admin/products");
    return { success: true, data: { updated: result.count } };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to map products to category." };
  }
}

/**
 * Batch publish products
 */
export async function batchPublishProductsAction(data: {
  productIds: string[];
  published: boolean;
}) {
  try {
    const session = await requireAdmin();
    const { organizationId } = session;

    const result = await prisma.product.updateMany({
      where: {
        id: { in: data.productIds },
        organizationId,
      },
      data: {
        published: data.published,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, data: { updated: result.count } };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to publish products." };
  }
}

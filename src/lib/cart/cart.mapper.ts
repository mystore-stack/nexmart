/**
 * Cart Mapper
 * Maps different item types to unified CartItem format
 */

import type { CartItem } from "./cart.types";
import { CART_ITEM_TYPES, CURRENCY } from "./cart.constants";
import { validatePrice, validateQuantity, validateStringField, validateCartImage } from "./cart.validation";

/**
 * Map Product to CartItem
 */
export function mapProductToCartItem(product: any, quantity: number = 1, variant?: any): CartItem {
  const price = validatePrice(variant?.price || product.price, product.name);
  const validatedQuantity = validateQuantity(quantity, product.name);
  const title = validateStringField(product.name, "name", product.name);
  const slug = validateStringField(product.slug, "slug", product.name);
  const image = validateCartImage({ image: product.images?.[0], product }, product.name);

  return {
    id: `PRODUCT-${product.id}-${variant?.id || "default"}`,
    type: CART_ITEM_TYPES.PRODUCT,
    title,
    slug,
    sku: variant?.sku || product.sku,
    image,
    price,
    compareAtPrice: product.comparePrice || variant?.comparePrice,
    quantity: validatedQuantity,
    currency: CURRENCY,
    metadata: {
      productId: product.id,
      variantId: variant?.id,
      categoryId: product.categoryId,
    },
  };
}

/**
 * Map Bundle Deal to CartItem
 */
export function mapBundleDealToCartItem(bundleDeal: any, quantity: number = 1): CartItem {
  // Try multiple price field names with fallback calculation
  let price = bundleDeal.bundlePrice || bundleDeal.price || bundleDeal.dealPrice || bundleDeal.discountedPrice;
  
  // If still no price, try to calculate from originalPrice and discount
  if (!price && bundleDeal.originalPrice && bundleDeal.discount) {
    price = bundleDeal.originalPrice * (1 - bundleDeal.discount / 100);
  }
  
  // If still no price, try originalPrice as fallback
  if (!price && bundleDeal.originalPrice) {
    price = bundleDeal.originalPrice;
  }
  
  const validatedPrice = validatePrice(price, bundleDeal.name);
  const validatedQuantity = validateQuantity(quantity, bundleDeal.name);
  const title = validateStringField(bundleDeal.name, "name", bundleDeal.name);
  const slug = validateStringField(bundleDeal.slug || bundleDeal.name.toLowerCase().replace(/\s+/g, "-"), "slug", bundleDeal.name);
  const image = validateCartImage(bundleDeal, bundleDeal.name);

  return {
    id: `BUNDLE-${bundleDeal.id}`,
    type: CART_ITEM_TYPES.BUNDLE,
    title,
    slug,
    sku: bundleDeal.sku,
    image,
    price: validatedPrice,
    compareAtPrice: bundleDeal.originalPrice,
    quantity: validatedQuantity,
    currency: CURRENCY,
    metadata: {
      bundleDealId: bundleDeal.id,
      discountPercent: bundleDeal.discountPercent,
      productIds: bundleDeal.products?.map((p: any) => p.productId),
    },
  };
}

/**
 * Map Mystery Box to CartItem
 */
export function mapMysteryBoxToCartItem(mysteryBox: any, quantity: number = 1): CartItem {
  const price = validatePrice(mysteryBox.price, mysteryBox.name);
  const validatedQuantity = validateQuantity(quantity, mysteryBox.name);
  const title = validateStringField(mysteryBox.name, "name", mysteryBox.name);
  const slug = validateStringField(mysteryBox.slug || mysteryBox.name.toLowerCase().replace(/\s+/g, "-"), "slug", mysteryBox.name);
  const image = validateCartImage(mysteryBox, mysteryBox.name);

  return {
    id: `MYSTERY_BOX-${mysteryBox.id}`,
    type: CART_ITEM_TYPES.MYSTERY_BOX,
    title,
    slug,
    sku: mysteryBox.sku,
    image,
    price,
    compareAtPrice: mysteryBox.originalPrice,
    quantity: validatedQuantity,
    currency: CURRENCY,
    metadata: {
      mysteryBoxId: mysteryBox.id,
      tier: mysteryBox.tier,
      itemCount: mysteryBox.products?.length,
    },
  };
}

/**
 * Map Flash Deal to CartItem
 */
export function mapFlashDealToCartItem(flashDeal: any, quantity: number = 1): CartItem {
  const price = validatePrice(flashDeal.discountAmount || flashDeal.product?.price, flashDeal.title || flashDeal.product?.name);
  const validatedQuantity = validateQuantity(quantity, flashDeal.title || flashDeal.product?.name);
  const title = validateStringField(flashDeal.title || flashDeal.product?.name, "title", flashDeal.title);
  const slug = validateStringField(flashDeal.slug || flashDeal.product?.slug, "slug", flashDeal.title);
  const image = validateCartImage(flashDeal, flashDeal.title);

  return {
    id: `FLASH_DEAL-${flashDeal.id}`,
    type: CART_ITEM_TYPES.FLASH_DEAL,
    title,
    slug,
    sku: flashDeal.product?.sku,
    image,
    price,
    compareAtPrice: flashDeal.product?.price,
    quantity: validatedQuantity,
    currency: CURRENCY,
    metadata: {
      flashDealId: flashDeal.id,
      productId: flashDeal.product?.id,
      discountPercent: flashDeal.discountPercent,
      endDate: flashDeal.endDate,
    },
  };
}

/**
 * Map Super Deal to CartItem
 */
export function mapSuperDealToCartItem(superDeal: any, quantity: number = 1): CartItem {
  const price = validatePrice(superDeal.dealPrice || superDeal.product?.price, superDeal.product?.name || superDeal.title);
  const validatedQuantity = validateQuantity(quantity, superDeal.product?.name || superDeal.title);
  const title = validateStringField(superDeal.product?.name || superDeal.title, "title", superDeal.product?.name);
  const slug = validateStringField(superDeal.product?.slug || superDeal.slug, "slug", superDeal.product?.name);
  const image = validateCartImage(superDeal, superDeal.product?.name);

  return {
    id: `SUPER_DEAL-${superDeal.id}`,
    type: CART_ITEM_TYPES.FLASH_DEAL, // Super deals use same type as flash deals
    title,
    slug,
    sku: superDeal.product?.sku,
    image,
    price,
    compareAtPrice: superDeal.product?.comparePrice || superDeal.product?.price,
    quantity: validatedQuantity,
    currency: CURRENCY,
    metadata: {
      superDealId: superDeal.id,
      productId: superDeal.product?.id,
      discountType: superDeal.discountType,
      discountValue: superDeal.discountValue,
      endDate: superDeal.endDate,
    },
  };
}

/**
 * Map Buy More Save More to CartItem
 */
export function mapBuyMoreSaveMoreToCartItem(deal: any, quantity: number = 1): CartItem {
  const price = validatePrice(deal.discountedPrice || deal.product?.price, deal.name);
  const validatedQuantity = validateQuantity(quantity, deal.name);
  const title = validateStringField(deal.name, "name", deal.nam);
  const slug = validateStringField(deal.slug || deal.name.toLowerCase().replace(/\s+/g, "-"), "slug", deal.name);
  const image = validateCartImage(deal, deal.name);

  return {
    id: `BUY_MORE_SAVE_MORE-${deal.id}`,
    type: CART_ITEM_TYPES.BUY_MORE_SAVE_MORE,
    title,
    slug,
    sku: deal.product?.sku,
    image,
    price,
    compareAtPrice: deal.product?.price,
    quantity: validatedQuantity,
    currency: CURRENCY,
    metadata: {
      dealId: deal.id,
      productId: deal.product?.id,
      minQuantity: deal.minQuantity,
      discountPercent: deal.discountPercent,
    },
  };
}

/**
 * Map Build Your Own Bundle to CartItem
 */
export function mapBuildBundleToCartItem(bundle: any, quantity: number = 1): CartItem {
  const price = validatePrice(bundle.totalPrice || bundle.basePrice, bundle.name);
  const validatedQuantity = validateQuantity(quantity, bundle.name);
  const title = validateStringField(bundle.name, "name", bundle.name);
  const slug = validateStringField(bundle.slug || bundle.name.toLowerCase().replace(/\s+/g, "-"), "slug", bundle.name);
  const image = validateCartImage(bundle, bundle.name);

  return {
    id: `BUILD_BUNDLE-${bundle.id}`,
    type: CART_ITEM_TYPES.BUILD_BUNDLE,
    title,
    slug,
    sku: bundle.sku,
    image,
    price,
    compareAtPrice: bundle.originalPrice,
    quantity: validatedQuantity,
    currency: CURRENCY,
    metadata: {
      bundleId: bundle.id,
      selectedProductIds: bundle.selectedProducts?.map((p: any) => p.id),
      categoryIds: bundle.categoryIds,
    },
  };
}

/**
 * Map Gift Card to CartItem
 */
export function mapGiftCardToCartItem(giftCard: any, quantity: number = 1): CartItem {
  const price = validatePrice(giftCard.amount, giftCard.name);
  const validatedQuantity = validateQuantity(quantity, giftCard.name);
  const title = validateStringField(giftCard.name, "name", giftCard.name);
  const slug = validateStringField(giftCard.slug || giftCard.name.toLowerCase().replace(/\s+/g, "-"), "slug", giftCard.name);
  const image = validateCartImage(giftCard, giftCard.name);

  return {
    id: `GIFT_CARD-${giftCard.id}`,
    type: CART_ITEM_TYPES.GIFT_CARD,
    title,
    slug,
    sku: giftCard.sku,
    image,
    price,
    quantity: validatedQuantity,
    currency: CURRENCY,
    metadata: {
      giftCardId: giftCard.id,
      amount: giftCard.amount,
      recipientEmail: giftCard.recipientEmail,
      message: giftCard.message,
    },
  };
}

/**
 * Map Digital Product to CartItem
 */
export function mapDigitalProductToCartItem(product: any, quantity: number = 1): CartItem {
  const price = validatePrice(product.price, product.name);
  const validatedQuantity = validateQuantity(quantity, product.name);
  const title = validateStringField(product.name, "name", product.name);
  const slug = validateStringField(product.slug, "slug", product.name);
  const image = validateCartImage(product, product.name);

  return {
    id: `DIGITAL-${product.id}`,
    type: CART_ITEM_TYPES.DIGITAL,
    title,
    slug,
    sku: product.sku,
    image,
    price,
    compareAtPrice: product.comparePrice,
    quantity: validatedQuantity,
    currency: CURRENCY,
    metadata: {
      productId: product.id,
      downloadUrl: product.downloadUrl,
      licenseType: product.licenseType,
    },
  };
}

/**
 * Generic mapper - auto-detects type and calls appropriate mapper
 */
export function mapToCartItem(item: any, quantity: number = 1): CartItem {
  // Check for explicit type
  if (item.itemType || item.type) {
    const type = (item.itemType || item.type).toUpperCase();
    
    switch (type) {
      case "PRODUCT":
        return mapProductToCartItem(item.product || item, quantity, item.variant);
      case "BUNDLE_DEAL":
      case "BUNDLE":
        return mapBundleDealToCartItem(item.bundleDeal || item, quantity);
      case "MYSTERY_BOX":
        return mapMysteryBoxToCartItem(item.mysteryBox || item, quantity);
      case "FLASH_DEAL":
        return mapFlashDealToCartItem(item.flashDeal || item, quantity);
      case "SUPER_DEAL":
        return mapSuperDealToCartItem(item.superDeal || item, quantity);
      case "BUY_MORE_SAVE_MORE":
        return mapBuyMoreSaveMoreToCartItem(item.deal || item, quantity);
      case "BUILD_YOUR_BUNDLE":
      case "BUILD_BUNDLE":
        return mapBuildBundleToCartItem(item.bundle || item, quantity);
      case "GIFT_CARD":
        return mapGiftCardToCartItem(item.giftCard || item, quantity);
      case "DIGITAL":
        return mapDigitalProductToCartItem(item.product || item, quantity);
    }
  }

  // Auto-detect based on available properties
  // Check for bundle deals first (most specific)
  if (item.bundleDealId || (item.products && Array.isArray(item.products)) || item.discountPercent || item.discount) {
    return mapBundleDealToCartItem(item, quantity);
  }
  if (item.bundlePrice) {
    return mapBundleDealToCartItem(item, quantity);
  }
  // Check for super deals
  if (item.dealPrice || item.superDealId) {
    return mapSuperDealToCartItem(item, quantity);
  }
  // Check for flash deals
  if (item.discountAmount || item.flashDealId) {
    return mapFlashDealToCartItem(item, quantity);
  }
  // Check for mystery boxes
  if (item.heroTitle || item.heroImage || item.mysteryBoxId) {
    return mapMysteryBoxToCartItem(item, quantity);
  }
  // Check for buy more save more
  if (item.minQuantity && item.discountPercent) {
    return mapBuyMoreSaveMoreToCartItem(item, quantity);
  }
  // Check for digital products
  if (item.downloadUrl || item.licenseType) {
    return mapDigitalProductToCartItem(item, quantity);
  }
  // Check for gift cards
  if (item.recipientEmail || item.amount) {
    return mapGiftCardToCartItem(item, quantity);
  }
  // Check for build your own bundle
  if (item.selectedProducts || item.categoryIds) {
    return mapBuildBundleToCartItem(item, quantity);
  }
  // Check for regular products
  if (item.price && item.category) {
    return mapProductToCartItem(item, quantity);
  }

  // Default to product - but only if it has a price
  if (item.price || item.bundlePrice || item.dealPrice) {
    return mapProductToCartItem(item, quantity);
  }

  // If no price found, throw a clear error
  throw new Error(`Cannot map item to cart: missing price field. Item: ${JSON.stringify(item)}`);
}

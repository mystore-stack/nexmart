import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Cache Revalidation Utility
 * 
 * This utility ensures that after any Admin CRUD operation,
 * the Homepage immediately reflects the changes.
 * 
 * Call this function after:
 * - Create
 * - Update
 * - Delete
 * - Publish
 * - Hide/Show
 * - Change Order
 * 
 * Usage:
 * import { revalidateHomepage } from "@/lib/cache-revalidation";
 * 
 * // After any CRUD operation
 * await revalidateHomepage();
 */

export async function revalidateHomepage() {
  try {
    // Revalidate the homepage path
    revalidatePath("/");
    
    // Revalidate the homepage cache tag
    revalidateTag("homepage");
    
    // Revalidate API routes
    revalidatePath("/api/homepage");
    
    // Revalidate specific section paths
    revalidatePath("/api/homepage/content");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to revalidate homepage cache:", error);
    return { success: false, error };
  }
}

/**
 * Revalidate specific sections
 */
export async function revalidateHomepageSection(section: string) {
  try {
    revalidatePath(`/api/homepage`);
    revalidateTag(`homepage-${section}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to revalidate ${section} cache:`, error);
    return { success: false, error };
  }
}

/**
 * Revalidate products section
 */
export async function revalidateProducts() {
  try {
    revalidatePath("/api/homepage");
    revalidateTag("homepage-products");
    revalidateTag("products");
    return { success: true };
  } catch (error) {
    console.error("Failed to revalidate products cache:", error);
    return { success: false, error };
  }
}

/**
 * Revalidate categories section
 */
export async function revalidateCategories() {
  try {
    revalidatePath("/api/homepage");
    revalidateTag("homepage-categories");
    revalidateTag("categories");
    return { success: true };
  } catch (error) {
    console.error("Failed to revalidate categories cache:", error);
    return { success: false, error };
  }
}

/**
 * Revalidate deals section (Flash Deals, Super Deals)
 */
export async function revalidateDeals() {
  try {
    revalidatePath("/api/homepage");
    revalidateTag("homepage-deals");
    revalidateTag("flash-deals");
    revalidateTag("super-deals");
    return { success: true };
  } catch (error) {
    console.error("Failed to revalidate deals cache:", error);
    return { success: false, error };
  }
}

/**
 * Revalidate mystery boxes section
 */
export async function revalidateMysteryBoxes() {
  try {
    revalidatePath("/api/homepage");
    revalidateTag("homepage-mystery-boxes");
    revalidateTag("mystery-boxes");
    return { success: true };
  } catch (error) {
    console.error("Failed to revalidate mystery boxes cache:", error);
    return { success: false, error };
  }
}

/**
 * Revalidate bundles section
 */
export async function revalidateBundles() {
  try {
    revalidatePath("/api/homepage");
    revalidateTag("homepage-bundles");
    revalidateTag("product-bundles");
    return { success: true };
  } catch (error) {
    console.error("Failed to revalidate bundles cache:", error);
    return { success: false, error };
  }
}

/**
 * Revalidate hero banners
 */
export async function revalidateHeroBanners() {
  try {
    revalidatePath("/api/homepage");
    revalidateTag("homepage-hero");
    revalidateTag("hero-banners");
    return { success: true };
  } catch (error) {
    console.error("Failed to revalidate hero banners cache:", error);
    return { success: false, error };
  }
}

/**
 * Revalidate announcement bars
 */
export async function revalidateAnnouncementBars() {
  try {
    revalidatePath("/api/homepage");
    revalidateTag("homepage-announcement");
    revalidateTag("announcement-bars");
    return { success: true };
  } catch (error) {
    console.error("Failed to revalidate announcement bars cache:", error);
    return { success: false, error };
  }
}

/**
 * Revalidate testimonials
 */
export async function revalidateTestimonials() {
  try {
    revalidatePath("/api/homepage");
    revalidateTag("homepage-testimonials");
    revalidateTag("testimonials");
    return { success: true };
  } catch (error) {
    console.error("Failed to revalidate testimonials cache:", error);
    return { success: false, error };
  }
}

/**
 * Revalidate brands
 */
export async function revalidateBrands() {
  try {
    revalidatePath("/api/homepage");
    revalidateTag("homepage-brands");
    revalidateTag("brands");
    return { success: true };
  } catch (error) {
    console.error("Failed to revalidate brands cache:", error);
    return { success: false, error };
  }
}

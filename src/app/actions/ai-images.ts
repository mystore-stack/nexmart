"use server";

import { createImageGenerationWorkflow, GenerationOptions, ImageGenerationResult } from "@/lib/ai/image-generation-workflow";
import { revalidatePath } from "next/cache";

export async function generateProductImages(options: GenerationOptions): Promise<ImageGenerationResult> {
  try {
    const workflow = createImageGenerationWorkflow();
    const result = await workflow.generateProductImages(options);
    
    revalidatePath(`/admin/products/${options.productId}`);
    revalidatePath("/admin/products");
    
    return result;
  } catch (error) {
    console.error("Server action error - generateProductImages:", error);
    return {
      success: false,
      images: [],
      errors: [error instanceof Error ? error.message : "Unknown error"],
      totalGenerated: 0,
      totalFailed: 0,
    };
  }
}

export async function regenerateProductImage(imageId: string) {
  try {
    const workflow = createImageGenerationWorkflow();
    const result = await workflow.regenerateImage(imageId);
    
    const image = await (await import("@/lib/prisma")).default.aIProductImage.findUnique({
      where: { id: imageId },
      select: { productId: true },
    });
    
    if (image?.productId) {
      revalidatePath(`/admin/products/${image.productId}`);
      revalidatePath("/admin/products");
    }
    
    return result;
  } catch (error) {
    console.error("Server action error - regenerateProductImage:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to regenerate image");
  }
}

export async function deleteProductImage(imageId: string) {
  try {
    const workflow = createImageGenerationWorkflow();
    const success = await workflow.deleteImage(imageId);
    
    const image = await (await import("@/lib/prisma")).default.aIProductImage.findUnique({
      where: { id: imageId },
      select: { productId: true },
    });
    
    if (image?.productId) {
      revalidatePath(`/admin/products/${image.productId}`);
      revalidatePath("/admin/products");
    }
    
    return success;
  } catch (error) {
    console.error("Server action error - deleteProductImage:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to delete image");
  }
}

export async function approveProductImage(imageId: string) {
  try {
    const workflow = createImageGenerationWorkflow();
    const success = await workflow.approveImage(imageId);
    
    revalidatePath("/admin/products");
    
    return success;
  } catch (error) {
    console.error("Server action error - approveProductImage:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to approve image");
  }
}

export async function rejectProductImage(imageId: string) {
  try {
    const workflow = createImageGenerationWorkflow();
    const success = await workflow.rejectImage(imageId);
    
    revalidatePath("/admin/products");
    
    return success;
  } catch (error) {
    console.error("Server action error - rejectProductImage:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to reject image");
  }
}

export async function setMainProductImage(imageId: string) {
  try {
    const workflow = createImageGenerationWorkflow();
    const success = await workflow.setMainImage(imageId);
    
    const image = await (await import("@/lib/prisma")).default.aIProductImage.findUnique({
      where: { id: imageId },
      select: { productId: true },
    });
    
    if (image?.productId) {
      revalidatePath(`/admin/products/${image.productId}`);
      revalidatePath("/admin/products");
    }
    
    return success;
  } catch (error) {
    console.error("Server action error - setMainProductImage:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to set main image");
  }
}

import { OpenAIImageGenerator, createOpenAIImageGenerator } from "./openai-images";
import { CloudinaryImageUploader, createCloudinaryUploader } from "../cloudinary/image-upload";
import { ProductImagePromptGenerator, createPromptGenerator, ProductData, ProductImageView } from "./prompt-generator";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface ImageGenerationResult {
  success: boolean;
  images: GeneratedImageResult[];
  errors: string[];
  totalGenerated: number;
  totalFailed: number;
}

export interface GeneratedImageResult {
  id: string;
  viewType: ProductImageView;
  url: string;
  cloudinaryPublicId: string;
  altText: string;
  title: string;
  caption: string;
  seoFilename: string;
  success: boolean;
  error?: string;
}

export interface GenerationOptions {
  productId: string;
  organizationId: string;
  userId?: string;
  generateLifestyle?: boolean;
  generatePackaging?: boolean;
  quality?: "standard" | "hd";
  autoApprove?: boolean;
}

export class ProductImageGenerationWorkflow {
  private openai: OpenAIImageGenerator;
  private cloudinary: CloudinaryImageUploader;
  private promptGenerator: ProductImagePromptGenerator;

  constructor() {
    this.openai = createOpenAIImageGenerator();
    this.cloudinary = createCloudinaryUploader();
    this.promptGenerator = createPromptGenerator();
  }

  async generateProductImages(options: GenerationOptions): Promise<ImageGenerationResult> {
    const {
      productId,
      organizationId,
      userId,
      generateLifestyle = true,
      generatePackaging = true,
      quality = "hd",
      autoApprove = false,
    } = options;

    const results: ImageGenerationResult = {
      success: true,
      images: [],
      errors: [],
      totalGenerated: 0,
      totalFailed: 0,
    };

    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { category: true },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      const productData: ProductData = {
        name: product.name,
        description: product.description,
        category: product.category?.name,
        brand: product.tags?.find((tag) => tag.startsWith("brand:"))?.replace("brand:", ""),
        color: product.tags?.find((tag) => tag.startsWith("color:"))?.replace("color:", ""),
        material: product.tags?.find((tag) => tag.startsWith("material:"))?.replace("material:", ""),
        features: product.tags?.filter((tag) => tag.startsWith("feature:")).map((tag) => tag.replace("feature:", "")),
        price: product.price,
      };

      const prompts = this.promptGenerator.generatePrompts(productData);

      const filteredPrompts = prompts.filter((prompt) => {
        if (prompt.viewType === "LIFESTYLE_SCENE" && !generateLifestyle) return false;
        if (prompt.viewType === "PACKAGING_SHOT" && !generatePackaging) return false;
        return true;
      });

      for (const promptData of filteredPrompts) {
        try {
          const imageResult = await this.generateAndUploadSingleImage(
            promptData,
            productData,
            productId,
            organizationId,
            quality,
            autoApprove
          );

          results.images.push(imageResult);

          if (imageResult.success) {
            results.totalGenerated++;
          } else {
            results.totalFailed++;
            results.errors.push(imageResult.error || "Unknown error");
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          results.errors.push(`Failed to generate ${promptData.viewType}: ${errorMessage}`);
          results.totalFailed++;
        }
      }

      if (results.totalGenerated > 0) {
        await this.updateProductImages(productId, results.images.filter((img) => img.success));
      }

      results.success = results.totalGenerated > 0;

      return results;
    } catch (error) {
      results.success = false;
      results.errors.push(error instanceof Error ? error.message : "Unknown error");
      return results;
    }
  }

  private async generateAndUploadSingleImage(
    promptData: { viewType: ProductImageView; prompt: string; imageType: string },
    productData: ProductData,
    productId: string,
    organizationId: string,
    quality: "standard" | "hd",
    autoApprove: boolean
  ): Promise<GeneratedImageResult> {
    const result: GeneratedImageResult = {
      id: "",
      viewType: promptData.viewType,
      url: "",
      cloudinaryPublicId: "",
      altText: "",
      title: "",
      caption: "",
      seoFilename: "",
      success: false,
    };

    try {
      const generatedImage = await this.openai.generateImage({
        prompt: promptData.prompt,
        model: "dall-e-3",
        size: "1024x1024",
        quality,
        style: "natural",
      });

      const seoFilename = this.promptGenerator.generateSEOFilename(productData, promptData.viewType);
      const publicId = `nexmart/products/${productId}/${seoFilename.replace(".webp", "")}`;

      const uploadResult = await this.cloudinary.uploadFromUrl(generatedImage.url, {
        publicId,
        folder: `nexmart/products/${productId}`,
        format: "webp",
        quality: 90,
      });

      const altText = this.promptGenerator.generateAltText(productData, promptData.viewType);
      const title = this.promptGenerator.generateImageTitle(productData, promptData.viewType);
      const caption = this.promptGenerator.generateCaption(productData, promptData.viewType);

      const dbRecord = await (prisma as any).aIProductImage.create({
        data: {
          organizationId,
          productId,
          imageType: promptData.imageType as any,
          viewType: promptData.viewType as any,
          cloudinaryPublicId: uploadResult.publicId,
          cloudinaryUrl: uploadResult.url,
          cloudinarySecureUrl: uploadResult.secureUrl,
          format: uploadResult.format,
          width: uploadResult.width,
          height: uploadResult.height,
          fileSize: uploadResult.bytes,
          fileSizeBytes: uploadResult.bytes,
          thumbnailUrl: this.cloudinary.getThumbnailUrl(uploadResult.publicId),
          smallUrl: this.cloudinary.getSmallUrl(uploadResult.publicId),
          mediumUrl: this.cloudinary.getMediumUrl(uploadResult.publicId),
          largeUrl: this.cloudinary.getLargeUrl(uploadResult.publicId),
          altText,
          title,
          caption,
          seoFilename,
          generationPrompt: promptData.prompt,
          generationModel: "dall-e-3",
          generationStatus: "COMPLETED",
          qualityScore: 85,
          isApproved: autoApprove,
          isMain: promptData.viewType === "FRONT",
          sortOrder: this.getSortOrderForView(promptData.viewType),
          generatedAt: new Date(),
          uploadedAt: new Date(),
        },
      });

      result.id = dbRecord.id;
      result.url = uploadResult.secureUrl;
      result.cloudinaryPublicId = uploadResult.publicId;
      result.altText = altText;
      result.title = title;
      result.caption = caption;
      result.seoFilename = seoFilename;
      result.success = true;

      return result;
    } catch (error) {
      result.error = error instanceof Error ? error.message : "Unknown error";
      return result;
    }
  }

  private getSortOrderForView(viewType: ProductImageView): number {
    const order: Record<ProductImageView, number> = {
      FRONT: 0,
      FORTY_FIVE_DEGREE: 1,
      SIDE: 2,
      BACK: 3,
      TOP: 4,
      CLOSE_UP: 5,
      LIFESTYLE_SCENE: 6,
      PACKAGING_SHOT: 7,
    };
    return order[viewType];
  }

  private async updateProductImages(productId: string, generatedImages: GeneratedImageResult[]): Promise<void> {
    const existingImages = await (prisma as any).aIProductImage.findMany({
      where: { productId, generationStatus: "COMPLETED" },
      orderBy: { sortOrder: "asc" },
    });

    const imageUrls = existingImages.map((img: any) => img.cloudinarySecureUrl || img.cloudinaryUrl).filter(Boolean);

    await prisma.product.update({
      where: { id: productId },
      data: {
        images: imageUrls,
      },
    });
  }

  async regenerateImage(imageId: string): Promise<GeneratedImageResult> {
    const existingImage = await (prisma as any).aIProductImage.findUnique({
      where: { id: imageId },
      include: { product: { include: { category: true } } },
    });

    if (!existingImage || !existingImage.product) {
      throw new Error("Image or product not found");
    }

    const productData: ProductData = {
      name: existingImage.product.name,
      description: existingImage.product.description,
      category: existingImage.product.category?.name,
      brand: existingImage.product.tags?.find((tag: string) => tag.startsWith("brand:"))?.replace("brand:", ""),
      color: existingImage.product.tags?.find((tag: string) => tag.startsWith("color:"))?.replace("color:", ""),
      material: existingImage.product.tags?.find((tag: string) => tag.startsWith("material:"))?.replace("material:", ""),
    };

    const viewType = existingImage.viewType as ProductImageView;
    const promptData = this.promptGenerator.generatePromptForView(productData, viewType);

    const result = await this.generateAndUploadSingleImage(
      promptData,
      productData,
      existingImage.productId,
      existingImage.organizationId,
      "hd",
      existingImage.isApproved
    );

    if (result.success) {
      await (prisma as any).aIProductImage.delete({
        where: { id: imageId },
      });
    }

    return result;
  }

  async deleteImage(imageId: string): Promise<boolean> {
    const image = await (prisma as any).aIProductImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return false;
    }

    if (image.cloudinaryPublicId) {
      await this.cloudinary.deleteImage(image.cloudinaryPublicId);
    }

    await (prisma as any).aIProductImage.delete({
      where: { id: imageId },
    });

    return true;
  }

  async approveImage(imageId: string): Promise<boolean> {
    await (prisma as any).aIProductImage.update({
      where: { id: imageId },
      data: { isApproved: true, generationStatus: "APPROVED" },
    });

    return true;
  }

  async rejectImage(imageId: string): Promise<boolean> {
    await (prisma as any).aIProductImage.update({
      where: { id: imageId },
      data: { isApproved: false, generationStatus: "REJECTED" },
    });

    return true;
  }

  async setMainImage(imageId: string): Promise<boolean> {
    const image = await (prisma as any).aIProductImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return false;
    }

    await (prisma as any).aIProductImage.updateMany({
      where: { productId: image.productId },
      data: { isMain: false },
    });

    await (prisma as any).aIProductImage.update({
      where: { id: imageId },
      data: { isMain: true },
    });

    return true;
  }
}

export function createImageGenerationWorkflow(): ProductImageGenerationWorkflow {
  return new ProductImageGenerationWorkflow();
}

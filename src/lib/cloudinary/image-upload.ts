import { v2 as cloudinary } from "cloudinary";

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  resourceType: string;
  version: number;
  signature: string;
  etag: string;
  createdAt: string;
}

export interface CloudinaryUploadOptions {
  file: string | Buffer;
  publicId?: string;
  folder?: string;
  transformation?: any;
  eager?: any[];
  format?: "webp" | "jpeg" | "png";
  quality?: number;
  fetchFormat?: boolean;
}

export class CloudinaryImageUploader {
  private cloudinaryConfig: typeof cloudinary;

  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    this.cloudinaryConfig = cloudinary;
  }

  async uploadImage(options: CloudinaryUploadOptions): Promise<CloudinaryUploadResult> {
    const {
      file,
      publicId,
      folder = "nexmart/products",
      transformation,
      eager,
      format = "webp",
      quality = 90,
      fetchFormat = true,
    } = options;

    try {
      const uploadOptions: any = {
        folder,
        format,
        quality,
        fetch_format: fetchFormat,
        transformation: transformation || [
          { width: 2048, height: 2048, crop: "limit", quality: "auto:good" },
        ],
        eager: eager || [
          { width: 200, height: 200, crop: "fill", format: "webp", quality: "auto" },
          { width: 400, height: 400, crop: "fill", format: "webp", quality: "auto" },
          { width: 800, height: 800, crop: "fill", format: "webp", quality: "auto" },
        ],
        eager_async: true,
      };

      if (publicId) {
        uploadOptions.public_id = publicId;
      }

      const result = await this.cloudinaryConfig.uploader.upload(file as string, uploadOptions);

      return {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        resourceType: result.resource_type,
        version: result.version,
        signature: result.signature,
        etag: result.etag,
        createdAt: result.created_at,
      };
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      throw new Error(`Failed to upload image to Cloudinary: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async uploadFromUrl(
    url: string,
    options?: Partial<CloudinaryUploadOptions>
  ): Promise<CloudinaryUploadResult> {
    return this.uploadImage({
      file: url,
      ...options,
    });
  }

  async uploadFromBuffer(
    buffer: Buffer,
    options?: Partial<CloudinaryUploadOptions>
  ): Promise<CloudinaryUploadResult> {
    return this.uploadImage({
      file: buffer,
      ...options,
    });
  }

  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await this.cloudinaryConfig.uploader.destroy(publicId);
      return result.result === "ok";
    } catch (error) {
      console.error("Cloudinary Delete Error:", error);
      return false;
    }
  }

  async deleteMultipleImages(publicIds: string[]): Promise<{ success: string[]; failed: string[] }> {
    const results = await Promise.allSettled(
      publicIds.map((id) => this.deleteImage(id))
    );

    const success: string[] = [];
    const failed: string[] = [];

    results.forEach((result, index) => {
      if (result.status === "fulfilled" && result.value) {
        success.push(publicIds[index]);
      } else {
        failed.push(publicIds[index]);
      }
    });

    return { success, failed };
  }

  getOptimizedUrl(publicId: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    crop?: string;
  } = {}): string {
    const {
      width = 800,
      height = 800,
      quality = 90,
      format = "webp",
      crop = "fill",
    } = options;

    return this.cloudinaryConfig.url(publicId, {
      transformation: [
        { width, height, crop, quality, fetch_format: format },
      ],
      secure: true,
    });
  }

  getThumbnailUrl(publicId: string): string {
    return this.getOptimizedUrl(publicId, { width: 200, height: 200 });
  }

  getSmallUrl(publicId: string): string {
    return this.getOptimizedUrl(publicId, { width: 400, height: 400 });
  }

  getMediumUrl(publicId: string): string {
    return this.getOptimizedUrl(publicId, { width: 800, height: 800 });
  }

  getLargeUrl(publicId: string): string {
    return this.getOptimizedUrl(publicId, { width: 1200, height: 1200 });
  }

  async generateProductImageVariants(
    publicId: string
  ): Promise<{
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
  }> {
    return {
      thumbnail: this.getThumbnailUrl(publicId),
      small: this.getSmallUrl(publicId),
      medium: this.getMediumUrl(publicId),
      large: this.getLargeUrl(publicId),
    };
  }
}

export function createCloudinaryUploader(): CloudinaryImageUploader {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary environment variables are not set");
  }
  return new CloudinaryImageUploader();
}

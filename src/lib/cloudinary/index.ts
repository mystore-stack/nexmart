import { CloudinaryImageUploader, createCloudinaryUploader } from "./image-upload";

let uploaderInstance: CloudinaryImageUploader | null = null;

function getUploader(): CloudinaryImageUploader {
  if (!uploaderInstance) {
    uploaderInstance = createCloudinaryUploader();
  }
  return uploaderInstance;
}

export async function uploadImage(
  file: Buffer,
  folder: string,
  options?: {
    public_id?: string;
    transformation?: any;
    eager?: any[];
    format?: "webp" | "jpeg" | "png";
    quality?: number;
    fetchFormat?: boolean;
  }
) {
  console.log("[CLOUDINARY] uploadImage called with folder:", folder);
  
  try {
    const uploader = getUploader();
    const result = await uploader.uploadFromBuffer(file, {
      folder,
      ...options,
    });
    console.log("[CLOUDINARY] Upload successful:", result.publicId);
    return result;
  } catch (error) {
    console.error("[CLOUDINARY] Upload failed:", error);
    throw error;
  }
}

export async function deleteImage(publicId: string) {
  console.log("[CLOUDINARY] deleteImage called for:", publicId);
  
  try {
    const uploader = getUploader();
    const result = await uploader.deleteImage(publicId);
    console.log("[CLOUDINARY] Delete result:", result);
    return result;
  } catch (error) {
    console.error("[CLOUDINARY] Delete failed:", error);
    throw error;
  }
}

export { CloudinaryImageUploader, createCloudinaryUploader } from "./image-upload";
export type { CloudinaryUploadResult, CloudinaryUploadOptions } from "./image-upload";

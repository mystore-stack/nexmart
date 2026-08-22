// src/lib/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export async function uploadImage(
  file: string | Buffer,
  folder: string = "nexmart",
  options: Record<string, unknown> = {}
): Promise<UploadResult> {
  const result = await new Promise<UploadResult>((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: "image" as const,
      quality: "auto:good",
      fetch_format: "auto",
      ...options,
    };

    if (typeof file === "string") {
      cloudinary.uploader.upload(file, uploadOptions, (error, result) => {
        if (error || !result) return reject(error || new Error("Upload failed"));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      });
    } else {
      const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error || !result) return reject(error || new Error("Upload failed"));
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      });
      stream.end(file);
    }
  });

  return result;
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function getOptimizedUrl(
  url: string,
  options: { width?: number; height?: number; quality?: string } = {}
): string {
  const { width, height, quality = "auto:good" } = options;

  // Transform Cloudinary URL
  if (!url.includes("cloudinary.com")) return url;

  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;

  const transforms: string[] = [`q_${quality}`, "f_auto"];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push("c_fill");

  return `${parts[0]}/upload/${transforms.join(",")}/${parts[1]}`;
}

export async function getSignedUploadParams(folder: string = "nexmart") {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const params = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  );
  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder,
  };
}

export default cloudinary;

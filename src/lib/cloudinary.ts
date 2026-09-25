import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";

type ResourceType = "image" | "video";

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error("CLOUDINARY_NOT_CONFIGURED");
  return { cloudName, apiKey, apiSecret };
}

export function assertCloudinaryConfigured() {
  getCloudinaryConfig();
}

export async function uploadToCloudinary(file: File, resourceType: ResourceType): Promise<Pick<UploadApiResponse, "secure_url" | "public_id" | "resource_type">> {
  const config = getCloudinaryConfig();
  cloudinary.config({ cloud_name: config.cloudName, api_key: config.apiKey, api_secret: config.apiSecret, secure: true });
  const content = Buffer.from(await file.arrayBuffer());
  const folder = resourceType === "image" ? "donprod/images" : "donprod/videos";
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ resource_type: resourceType, folder }, (error, result) => {
      if (error || !result) return reject(error ?? new Error("CLOUDINARY_UPLOAD_FAILED"));
      resolve(result);
    });
    stream.end(content);
  });
}

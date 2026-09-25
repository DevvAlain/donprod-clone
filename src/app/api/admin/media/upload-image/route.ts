import { failure, success } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { uploadToCloudinary } from "@/lib/cloudinary";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function getMaxBytes() { return (Number(process.env.IMAGE_MAX_SIZE_MB) || 10) * 1024 * 1024; }

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    await requireAdmin();
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return failure("Multipart form data is required.", 422);
    }
    const file = formData.get("file");
    if (!(file instanceof File)) return failure("An image file is required.", 422);
    if (!allowedTypes.has(file.type)) return failure("Unsupported image file type.", 422);
    if (file.size === 0) return failure("Image file is empty.", 422);
    if (file.size > getMaxBytes()) return failure("Image file exceeds the configured size limit.", 413);
    const asset = await uploadToCloudinary(file, "image");
    return success({ url: asset.secure_url, publicId: asset.public_id, resourceType: "image" }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return failure("Unauthorized.", 401);
    if (error instanceof Error && error.message === "CLOUDINARY_NOT_CONFIGURED") return failure("Cloudinary is not configured.", 503);
    console.error("Cloudinary image upload failed", error);
    return failure("Image upload failed.", 502);
  }
}

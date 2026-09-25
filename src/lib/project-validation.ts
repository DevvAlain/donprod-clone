import { z } from "zod";
import { getYouTubeVideoId, isCloudinaryDeliveryUrl, getVimeoVideoId } from "@/lib/youtube";

const tagSlugSchema = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80);

const creditSchema = z.object({
  label: z.string().trim().min(1).max(120),
  value: z.string().trim().min(1).max(2000),
});

const stillSchema = z.object({
  imageUrl: z.string().url().max(2048),
  placeholderUrl: z.string().url().max(2048).nullable().optional(),
  publicId: z.string().trim().min(1).max(512).nullable().optional(),
});

const contentSchema = z.object({
  rollingTitle: z.array(z.string().max(300)).max(10).optional(),
  splitQuote: z.array(z.string().max(300)).max(10).optional(),
  minorQuote: z.array(z.string().max(300)).max(10).optional(),
  lastQuote: z.array(z.string().max(300)).max(10).optional(),
  heroQuote: z.array(z.string().max(300)).max(10).optional(),
}).strict();

const projectFields = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  title: z.string().trim().min(1).max(240),
  artist: z.string().trim().max(240).nullable().optional(),
  videoType: z.enum(["YOUTUBE", "CLOUDINARY", "VIMEO"]).nullable().optional(),
  videoUrl: z.string().url().max(2048).nullable().optional(),
  videoPublicId: z.string().trim().min(1).max(512).nullable().optional(),
  aspectRatio: z.number().positive().max(100).optional(),
  dateLabel: z.string().trim().max(120).nullable().optional(),
  runtimeSeconds: z.number().int().nonnegative().max(86400).nullable().optional(),
  locations: z.array(z.string().trim().min(1).max(160)).max(20).optional(),
  coordinates: z.array(z.string().trim().min(1).max(120)).max(20).optional(),
  description: z.string().trim().max(10000).nullable().optional(),
  keywords: z.array(z.string().trim().min(1).max(120)).max(40).optional(),
  content: contentSchema.nullable().optional(),
  thumbnailDesktopUrl: z.string().url().max(2048).nullable().optional(),
  thumbnailDesktopPublicId: z.string().trim().min(1).max(512).nullable().optional(),
  thumbnailMobileUrl: z.string().url().max(2048).nullable().optional(),
  thumbnailMobilePublicId: z.string().trim().min(1).max(512).nullable().optional(),
  thumbnailPlaceholderUrl: z.string().url().max(2048).nullable().optional(),
  thumbnailPlaceholderPublicId: z.string().trim().min(1).max(512).nullable().optional(),
  mobilePreviewUrl: z.string().url().max(2048).nullable().optional(),
  seoTitle: z.string().trim().max(240).nullable().optional(),
  seoDescription: z.string().trim().max(1000).nullable().optional(),
  ogImageUrl: z.string().url().max(2048).nullable().optional(),
  visibility: z.enum(["VISIBLE", "HIDDEN"]).optional(),
  tags: z.array(tagSlugSchema).max(10).optional(),
  credits: z.array(creditSchema).max(100).optional(),
  stills: z.array(stillSchema).max(100).optional(),
}).strict();

function validateVideo(data: { videoType?: "YOUTUBE" | "CLOUDINARY" | "VIMEO" | null; videoUrl?: string | null; videoPublicId?: string | null }, context: z.RefinementCtx) {
  const hasVideoFields = data.videoUrl !== undefined || data.videoPublicId !== undefined;
  if (data.videoType === null && data.videoUrl === null && data.videoPublicId === null) return;
  if (!data.videoType && hasVideoFields) {
    context.addIssue({ code: "custom", path: ["videoType"], message: "videoType is required when video fields are supplied." });
  }
  if (data.videoType === "YOUTUBE") {
    if (!data.videoUrl) context.addIssue({ code: "custom", path: ["videoUrl"], message: "A YouTube URL is required." });
    if (data.videoUrl && !getYouTubeVideoId(data.videoUrl)) context.addIssue({ code: "custom", path: ["videoUrl"], message: "A valid YouTube URL is required." });
    if (data.videoPublicId !== null && data.videoPublicId !== undefined) context.addIssue({ code: "custom", path: ["videoPublicId"], message: "YouTube videos cannot have a public ID." });
  }
  if (data.videoType === "CLOUDINARY") {
    if (!data.videoUrl) context.addIssue({ code: "custom", path: ["videoUrl"], message: "A Cloudinary URL is required." });
    if (data.videoUrl && !isCloudinaryDeliveryUrl(data.videoUrl)) context.addIssue({ code: "custom", path: ["videoUrl"], message: "A valid Cloudinary delivery URL is required." });
    if (!data.videoPublicId) context.addIssue({ code: "custom", path: ["videoPublicId"], message: "A Cloudinary public ID is required." });
  }
  if (data.videoType === "VIMEO") {
    if (!data.videoUrl) context.addIssue({ code: "custom", path: ["videoUrl"], message: "A Vimeo URL is required." });
    if (data.videoUrl && !getVimeoVideoId(data.videoUrl)) context.addIssue({ code: "custom", path: ["videoUrl"], message: "A valid Vimeo URL is required." });
    if (data.videoPublicId !== null && data.videoPublicId !== undefined) context.addIssue({ code: "custom", path: ["videoPublicId"], message: "Vimeo videos cannot have a public ID." });
  }
}

export const projectInputSchema = projectFields.superRefine((data, context) => validateVideo(data, context));

export const projectUpdateSchema = projectFields.partial().superRefine((data, context) => {
  if (data.videoType !== undefined || data.videoUrl !== undefined || data.videoPublicId !== undefined) validateVideo(data, context);
});

export const reorderSchema = z.object({
  projectIds: z.array(z.string().uuid()).min(1).max(500),
}).strict();

export const loginSchema = z.object({
  email: z.string().trim().email().max(320).toLowerCase(),
  password: z.string().min(1).max(1024),
}).strict();

export type ProjectInput = z.infer<typeof projectInputSchema>;
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;

import { z } from "zod";

const safeUrl = z.string().trim().url().max(2048).refine((value) => /^https?:\/\//i.test(value) || /^mailto:/i.test(value), "Only HTTP(S) and mailto URLs are allowed.");

const socialLinkSchema = z.object({
  label: z.string().trim().min(1).max(40),
  url: safeUrl,
}).strict();

const btsImageSchema = z.object({
  imageUrl: safeUrl,
  publicId: z.string().trim().min(1).max(512).nullable().optional(),
}).strict();

export const contactSettingsSchema = z.object({
  readyText: z.string().trim().min(1).max(120),
  designerLabel: z.string().trim().min(1).max(240),
  designerUrl: safeUrl,
  locationName: z.string().trim().min(1).max(120),
  locationAddress: z.string().trim().min(1).max(240),
  coordinates: z.string().trim().min(1).max(240),
  footerBrand: z.string().trim().min(1).max(120),
  footerDescription: z.string().trim().min(1).max(240),
  copyrightYear: z.string().trim().regex(/^\d{4}$/),
  showreelUrl: safeUrl,
  tickerText: z.string().trim().min(1).max(240),
  socialLinks: z.array(socialLinkSchema).max(12),
  btsImages: z.array(btsImageSchema).max(100),
}).strict();

export type ContactSettingsInput = z.infer<typeof contactSettingsSchema>;

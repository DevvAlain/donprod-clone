import { z } from "zod";

const imageUrl = z.string().trim().url().max(2048).refine((value) => /^https?:\/\//i.test(value), "Only HTTP(S) URLs are allowed.");

const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(140);

const galleryImage = z.object({
  imageUrl: imageUrl,
  publicId: z.string().trim().min(1).max(512).nullable().optional(),
});

const creditEntry = z.object({
  label: z.string().trim().min(1).max(120),
  value: z.string().trim().min(1).max(2000),
});

export const tvcItemSchema = z.object({
  type: z.enum(["HIGHLIGHTED", "CSR"]),
  title: z.string().trim().min(1).max(240),
  slug: slug.optional(),
  description: z.string().trim().max(20000).nullable().optional(),
  imageUrl: imageUrl.nullable().optional(),
  imagePublicId: z.string().trim().min(1).max(512).nullable().optional(),
  gallery: z.array(galleryImage).max(20).optional(),
  credits: z.array(creditEntry).max(40).optional(),
  dateLabel: z.string().trim().max(120).nullable().optional(),
  location: z.string().trim().max(160).nullable().optional(),
}).strict();

export const tvcItemUpdateSchema = tvcItemSchema.partial();

export const tvcReorderSchema = z.object({
  itemIds: z.array(z.string().uuid()).min(1).max(200),
}).strict();

export type TvcItemInput = z.infer<typeof tvcItemSchema>;
export type TvcItemUpdate = z.infer<typeof tvcItemUpdateSchema>;

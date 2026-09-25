import { z } from "zod";

const imageUrl = z.string().trim().url().max(2048).refine((value) => /^https?:\/\//i.test(value), "Only HTTP(S) URLs are allowed.");

export const tvcItemSchema = z.object({
  type: z.enum(["HIGHLIGHTED", "CSR"]),
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().max(20000).nullable().optional(),
  imageUrl: imageUrl.nullable().optional(),
  imagePublicId: z.string().trim().min(1).max(512).nullable().optional(),
}).strict();

export const tvcItemUpdateSchema = tvcItemSchema.partial();

export const tvcReorderSchema = z.object({
  itemIds: z.array(z.string().uuid()).min(1).max(200),
}).strict();

export type TvcItemInput = z.infer<typeof tvcItemSchema>;
export type TvcItemUpdate = z.infer<typeof tvcItemUpdateSchema>;

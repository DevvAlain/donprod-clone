import type { Prisma, TvcItem as TvcItemRow, TvcType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeYouTubeUrl } from "@/lib/youtube";
import type { TvcItemInput, TvcItemUpdate } from "@/lib/tvc-validation";

export interface TvcGalleryImage {
  imageUrl: string;
  publicId?: string | null;
}

export interface TvcCredit {
  label: string;
  value: string;
}

export interface TvcItem {
  id: string;
  type: TvcType;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  imagePublicId?: string | null;
  gallery: TvcGalleryImage[];
  credits: TvcCredit[];
  dateLabel: string | null;
  location: string | null;
  youtubeUrl: string | null;
  displayOrder: number;
  updatedAt?: string;
}

function parseGallery(value: unknown): TvcGalleryImage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null)
    .map((entry) => ({
      imageUrl: typeof entry.imageUrl === "string" ? entry.imageUrl : "",
      publicId: typeof entry.publicId === "string" ? entry.publicId : null,
    }))
    .filter((entry) => entry.imageUrl.length > 0);
}

function parseCredits(value: unknown): TvcCredit[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null)
    .map((entry) => ({
      label: typeof entry.label === "string" ? entry.label : "",
      value: typeof entry.value === "string" ? entry.value : "",
    }))
    .filter((entry) => entry.label.length > 0 && entry.value.length > 0);
}

function fromRow(row: TvcItemRow, includeAdmin = false): TvcItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    slug: row.slug,
    description: row.description,
    imageUrl: row.imageUrl,
    imagePublicId: includeAdmin ? row.imagePublicId : undefined,
    gallery: parseGallery(row.gallery),
    credits: parseCredits(row.credits),
    dateLabel: row.dateLabel,
    location: row.location,
    youtubeUrl: row.youtubeUrl,
    displayOrder: row.displayOrder,
    updatedAt: includeAdmin ? row.updatedAt.toISOString() : undefined,
  };
}

export function slugifyTitle(title: string): string {
  const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "item";
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const clean = slugifyTitle(base);
  let candidate = clean;
  let attempt = 1;
  for (;;) {
    const existing = await prisma.tvcItem.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing || existing.id === excludeId) return candidate;
    attempt += 1;
    candidate = `${clean}-${attempt}`;
  }
}

export async function listTvcItems(includeAdmin = false) {
  const rows = await prisma.tvcItem.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.map((row) => fromRow(row, includeAdmin));
}

export async function listTvcSitemapEntries() {
  return prisma.tvcItem.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function createTvcItem(input: TvcItemInput) {
  const highest = await prisma.tvcItem.aggregate({ _max: { displayOrder: true } });
  const row = await prisma.tvcItem.create({
    data: {
      type: input.type,
      title: input.title,
      slug: await uniqueSlug(input.slug?.trim() ? input.slug : input.title),
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
      imagePublicId: input.imagePublicId ?? null,
      gallery: (input.gallery ?? []) as unknown as Prisma.InputJsonValue,
      credits: (input.credits ?? []) as unknown as Prisma.InputJsonValue,
      dateLabel: input.dateLabel ?? null,
      location: input.location ?? null,
      youtubeUrl: input.youtubeUrl ? normalizeYouTubeUrl(input.youtubeUrl) : null,
      displayOrder: (highest._max.displayOrder ?? -1) + 1,
    },
  });
  return fromRow(row, true);
}

export async function updateTvcItem(id: string, input: TvcItemUpdate) {
  const row = await prisma.tvcItem.update({
    where: { id },
    data: {
      ...(input.type !== undefined ? { type: input.type } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.slug !== undefined
        ? { slug: await uniqueSlug(input.slug.trim() ? input.slug : "item", id) }
        : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      ...(input.imagePublicId !== undefined ? { imagePublicId: input.imagePublicId } : {}),
      ...(input.gallery !== undefined
        ? { gallery: input.gallery as unknown as Prisma.InputJsonValue }
        : {}),
      ...(input.credits !== undefined
        ? { credits: input.credits as unknown as Prisma.InputJsonValue }
        : {}),
      ...(input.dateLabel !== undefined ? { dateLabel: input.dateLabel } : {}),
      ...(input.location !== undefined ? { location: input.location } : {}),
      ...(input.youtubeUrl !== undefined
        ? { youtubeUrl: input.youtubeUrl ? normalizeYouTubeUrl(input.youtubeUrl) : null }
        : {}),
    },
  });
  return fromRow(row, true);
}

export async function getTvcItemBySlug(slug: string) {
  const row = await prisma.tvcItem.findUnique({ where: { slug: slug.toLowerCase() } });
  return row ? fromRow(row) : null;
}

export async function deleteTvcItem(id: string) {
  await prisma.tvcItem.delete({ where: { id } });
}

export async function reorderTvcItems(itemIds: string[]) {
  const found = await prisma.tvcItem.count({ where: { id: { in: itemIds } } });
  if (found !== itemIds.length) throw new Error("TVC_ITEM_NOT_FOUND");
  await prisma.$transaction(
    itemIds.map((id, displayOrder) => prisma.tvcItem.update({ where: { id }, data: { displayOrder } })),
  );
}

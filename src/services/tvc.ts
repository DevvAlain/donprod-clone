import type { TvcItem as TvcItemRow, TvcType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { TvcItemInput, TvcItemUpdate } from "@/lib/tvc-validation";

export interface TvcItem {
  id: string;
  type: TvcType;
  title: string;
  description: string | null;
  imageUrl: string | null;
  imagePublicId?: string | null;
  displayOrder: number;
  updatedAt?: string;
}

function fromRow(row: TvcItemRow, includeAdmin = false): TvcItem {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    imageUrl: row.imageUrl,
    imagePublicId: includeAdmin ? row.imagePublicId : undefined,
    displayOrder: row.displayOrder,
    updatedAt: includeAdmin ? row.updatedAt.toISOString() : undefined,
  };
}

export async function listTvcItems(includeAdmin = false) {
  const rows = await prisma.tvcItem.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.map((row) => fromRow(row, includeAdmin));
}

export async function createTvcItem(input: TvcItemInput) {
  const highest = await prisma.tvcItem.aggregate({ _max: { displayOrder: true } });
  const row = await prisma.tvcItem.create({
    data: {
      type: input.type,
      title: input.title,
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
      imagePublicId: input.imagePublicId ?? null,
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
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
      ...(input.imagePublicId !== undefined ? { imagePublicId: input.imagePublicId } : {}),
    },
  });
  return fromRow(row, true);
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

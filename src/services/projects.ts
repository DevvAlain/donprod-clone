import { Prisma, ProjectVisibility } from "@prisma/client";
import type { DonprodProject } from "@/types/donprod";
import { prisma } from "@/lib/prisma";
import type { ProjectInput, ProjectUpdate } from "@/lib/project-validation";
import { normalizeYouTubeUrl, normalizeVimeoUrl } from "@/lib/youtube";

const projectInclude = {
  tags: { include: { tag: true }, orderBy: { tag: { slug: "asc" } } },
  credits: { orderBy: { displayOrder: "asc" } },
  stills: { orderBy: { displayOrder: "asc" } },
} satisfies Prisma.ProjectInclude;

type ProjectWithRelations = Prisma.ProjectGetPayload<{ include: typeof projectInclude }>;

function asContent(value: Prisma.JsonValue | null): DonprodProject["content"] {
  const fallback: DonprodProject["content"] = {
    rollingTitle: [], splitQuote: [], minorQuote: [], lastQuote: [], heroQuote: [],
  };
  if (!value || typeof value !== "object" || Array.isArray(value)) return fallback;
  const source = value as Record<string, Prisma.JsonValue>;
  return {
    rollingTitle: Array.isArray(source.rollingTitle) ? source.rollingTitle.filter((item): item is string => typeof item === "string") : [],
    splitQuote: Array.isArray(source.splitQuote) ? source.splitQuote.filter((item): item is string => typeof item === "string") : [],
    minorQuote: Array.isArray(source.minorQuote) ? source.minorQuote.filter((item): item is string => typeof item === "string") : [],
    lastQuote: Array.isArray(source.lastQuote) ? source.lastQuote.filter((item): item is string => typeof item === "string") : [],
    heroQuote: Array.isArray(source.heroQuote) ? source.heroQuote.filter((item): item is string => typeof item === "string") : [],
  };
}

export function toDonprodProject(project: ProjectWithRelations, includeVideoPublicId = false, includeAdminFields = false): DonprodProject {
  const locations = project.locations;
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    artist: project.artist,
    feature: null,
    vimeo: project.videoUrl ?? "",
    videoType: project.videoType,
    videoUrl: project.videoUrl,
    videoPublicId: includeVideoPublicId ? project.videoPublicId : null,
    aspectRatio: Number(project.aspectRatio),
    tags: includeAdminFields ? project.tags.map(({ tag }) => tag.slug) : project.tags.flatMap(({ tag }) => {
      if (tag.slug === "music") return [1];
      if (tag.slug === "commercial") return [2];
      return [];
    }),
    credits: Object.fromEntries(project.credits.map((credit) => [credit.label, credit.value])),
    meta: {
      date: project.dateLabel ?? "",
      runTime: [Math.floor((project.runtimeSeconds ?? 0) / 60), (project.runtimeSeconds ?? 0) % 60],
      location: locations.length <= 1 ? (locations[0] ?? "") : locations,
      coords: project.coordinates.length > 0 ? project.coordinates : null,
    },
    description: project.description ?? "",
    keywords: project.keywords,
    content: asContent(project.content),
    thumbnails: {
      placeholder: project.thumbnailPlaceholderUrl ?? "",
      mobile: project.thumbnailMobileUrl ?? "",
      laptop: project.thumbnailDesktopUrl ?? "",
      desktop: project.thumbnailDesktopUrl ?? "",
    },
    thumbMobile: project.thumbnailMobileUrl ?? "",
    thumbDesktop: project.thumbnailDesktopUrl ?? "",
    thumbPlaceholder: project.thumbnailPlaceholderUrl ?? "",
    thumbnailDesktopPublicId: includeAdminFields ? project.thumbnailDesktopPublicId : undefined,
    thumbnailMobilePublicId: includeAdminFields ? project.thumbnailMobilePublicId : undefined,
    thumbnailPlaceholderPublicId: includeAdminFields ? project.thumbnailPlaceholderPublicId : undefined,
    mobileVideo: project.mobilePreviewUrl ?? "",
    seoTitle: project.seoTitle,
    seoDescription: project.seoDescription,
    ogImageUrl: project.ogImageUrl,
    visibility: includeAdminFields ? project.visibility : undefined,
    viewCount: includeAdminFields ? project.viewCount : undefined,
    updatedAt: includeAdminFields ? project.updatedAt.toISOString() : undefined,
    gifStyling: { backgroundImage: project.thumbnailDesktopUrl ?? "", mobileVideo: project.mobilePreviewUrl ?? "" },
    stills: project.stills.map((still) => ({ backgroundImage: still.imageUrl, placeholder: still.placeholderUrl ?? "", publicId: still.publicId })),
    numberStills: project.stills.length,
  };
}

function projectCreateData(data: ProjectInput): Prisma.ProjectUncheckedCreateInput {
  let videoUrl = data.videoUrl ?? null;
  if (data.videoType === "YOUTUBE" && data.videoUrl) videoUrl = normalizeYouTubeUrl(data.videoUrl);
  if (data.videoType === "VIMEO" && data.videoUrl) videoUrl = normalizeVimeoUrl(data.videoUrl);
  return {
    slug: data.slug ?? "",
    title: data.title ?? "",
    artist: data.artist ?? null,
    videoType: data.videoType ?? null,
    videoUrl,
    videoPublicId: data.videoType === "CLOUDINARY" ? data.videoPublicId ?? null : null,
    aspectRatio: data.aspectRatio ?? 1.7778,
    dateLabel: data.dateLabel ?? null,
    runtimeSeconds: data.runtimeSeconds ?? null,
    locations: data.locations ?? [],
    coordinates: data.coordinates ?? [],
    description: data.description ?? null,
    keywords: data.keywords ?? [],
    content: data.content === null ? Prisma.JsonNull : data.content ?? Prisma.JsonNull,
    thumbnailDesktopUrl: data.thumbnailDesktopUrl ?? null,
    thumbnailDesktopPublicId: data.thumbnailDesktopPublicId ?? null,
    thumbnailMobileUrl: data.thumbnailMobileUrl ?? null,
    thumbnailMobilePublicId: data.thumbnailMobilePublicId ?? null,
    thumbnailPlaceholderUrl: data.thumbnailPlaceholderUrl ?? null,
    thumbnailPlaceholderPublicId: data.thumbnailPlaceholderPublicId ?? null,
    mobilePreviewUrl: data.mobilePreviewUrl ?? null,
    seoTitle: data.seoTitle ?? null,
    seoDescription: data.seoDescription ?? null,
    ogImageUrl: data.ogImageUrl ?? null,
    visibility: data.visibility ?? ProjectVisibility.VISIBLE,
  };
}

function tagConnectOrCreate(tags: string[]) {
  return tags.map((slug) => ({
    where: { slug },
    create: { slug, name: slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) },
  }));
}

export async function listProjects(includeHidden = false) {
  const projects = await prisma.project.findMany({
    where: includeHidden ? undefined : { visibility: ProjectVisibility.VISIBLE },
    include: projectInclude,
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
  return projects.map((project) => toDonprodProject(project, includeHidden, includeHidden));
}

export async function getProjectBySlug(slug: string, includeHidden = false) {
  const project = await prisma.project.findFirst({
    where: { slug: { equals: slug, mode: "insensitive" }, ...(includeHidden ? {} : { visibility: ProjectVisibility.VISIBLE }) },
    include: projectInclude,
  });
  return project ? toDonprodProject(project) : null;
}

export async function getProjectById(id: string) {
  const project = await prisma.project.findUnique({ where: { id }, include: projectInclude });
  return project ? toDonprodProject(project, true, true) : null;
}

export async function createProject(input: ProjectInput) {
  const highestOrder = await prisma.project.aggregate({ _max: { displayOrder: true } });
  const project = await prisma.project.create({
    data: {
      ...projectCreateData(input),
      displayOrder: (highestOrder._max.displayOrder ?? -1) + 1,
      tags: { create: tagConnectOrCreate(input.tags ?? []).map(({ where, create }) => ({ tag: { connectOrCreate: { where, create } } })) },
      credits: { create: (input.credits ?? []).map((credit, displayOrder) => ({ ...credit, displayOrder })) },
      stills: { create: (input.stills ?? []).map((still, displayOrder) => ({ ...still, displayOrder })) },
    },
    include: projectInclude,
  });
  return toDonprodProject(project, true, true);
}

export async function updateProject(id: string, input: ProjectUpdate) {
  const data: Prisma.ProjectUpdateInput = {};
  if (input.slug !== undefined) data.slug = input.slug;
  if (input.title !== undefined) data.title = input.title;
  if (input.artist !== undefined) data.artist = input.artist;
  if (input.videoType !== undefined) data.videoType = input.videoType;
  if (input.videoUrl !== undefined) {
    let videoUrl = input.videoUrl;
    if (input.videoType === "YOUTUBE" && input.videoUrl) videoUrl = normalizeYouTubeUrl(input.videoUrl);
    if (input.videoType === "VIMEO" && input.videoUrl) videoUrl = normalizeVimeoUrl(input.videoUrl);
    data.videoUrl = videoUrl;
  }
  if (input.videoPublicId !== undefined) data.videoPublicId = input.videoPublicId;
  if (input.aspectRatio !== undefined) data.aspectRatio = input.aspectRatio;
  if (input.dateLabel !== undefined) data.dateLabel = input.dateLabel;
  if (input.runtimeSeconds !== undefined) data.runtimeSeconds = input.runtimeSeconds;
  if (input.locations !== undefined) data.locations = input.locations;
  if (input.coordinates !== undefined) data.coordinates = input.coordinates;
  if (input.description !== undefined) data.description = input.description;
  if (input.keywords !== undefined) data.keywords = input.keywords;
  if (input.content !== undefined) data.content = input.content === null ? Prisma.JsonNull : input.content;
  if (input.thumbnailDesktopUrl !== undefined) data.thumbnailDesktopUrl = input.thumbnailDesktopUrl;
  if (input.thumbnailDesktopPublicId !== undefined) data.thumbnailDesktopPublicId = input.thumbnailDesktopPublicId;
  if (input.thumbnailMobileUrl !== undefined) data.thumbnailMobileUrl = input.thumbnailMobileUrl;
  if (input.thumbnailMobilePublicId !== undefined) data.thumbnailMobilePublicId = input.thumbnailMobilePublicId;
  if (input.thumbnailPlaceholderUrl !== undefined) data.thumbnailPlaceholderUrl = input.thumbnailPlaceholderUrl;
  if (input.thumbnailPlaceholderPublicId !== undefined) data.thumbnailPlaceholderPublicId = input.thumbnailPlaceholderPublicId;
  if (input.mobilePreviewUrl !== undefined) data.mobilePreviewUrl = input.mobilePreviewUrl;
  if (input.seoTitle !== undefined) data.seoTitle = input.seoTitle;
  if (input.seoDescription !== undefined) data.seoDescription = input.seoDescription;
  if (input.ogImageUrl !== undefined) data.ogImageUrl = input.ogImageUrl;
  if (input.visibility !== undefined) data.visibility = input.visibility;
  if (input.tags) {
    data.tags = { deleteMany: {}, create: tagConnectOrCreate(input.tags).map(({ where, create }) => ({ tag: { connectOrCreate: { where, create } } })) };
  }
  if (input.credits) data.credits = { deleteMany: {}, create: input.credits.map((credit, displayOrder) => ({ ...credit, displayOrder })) };
  if (input.stills) data.stills = { deleteMany: {}, create: input.stills.map((still, displayOrder) => ({ ...still, displayOrder })) };
  const project = await prisma.project.update({ where: { id }, data, include: projectInclude });
  return toDonprodProject(project, true, true);
}

export async function deleteProject(id: string) {
  await prisma.project.delete({ where: { id } });
}

export async function reorderProjects(projectIds: string[]) {
  const found = await prisma.project.count({ where: { id: { in: projectIds } } });
  if (found !== projectIds.length) throw new Error("PROJECT_NOT_FOUND");
  await prisma.$transaction(
    projectIds.map((id, displayOrder) =>
      prisma.project.update({ where: { id }, data: { displayOrder } }),
    ),
  );
}

export async function recordProjectView(slug: string, visitorHash: string) {
  const project = await prisma.project.findFirst({ where: { slug: { equals: slug, mode: "insensitive" }, visibility: ProjectVisibility.VISIBLE }, select: { id: true, viewCount: true } });
  if (!project) return null;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
  const existing = await prisma.projectViewDedup.findUnique({ where: { projectId_visitorHash: { projectId: project.id, visitorHash } } });
  if (!existing || existing.expiresAt <= now) {
    await prisma.$transaction([
      prisma.projectViewDedup.upsert({ where: { projectId_visitorHash: { projectId: project.id, visitorHash } }, create: { projectId: project.id, visitorHash, expiresAt }, update: { expiresAt } }),
      prisma.project.update({ where: { id: project.id }, data: { viewCount: { increment: 1 } } }),
    ]);
    return { counted: true };
  }
  return { counted: false };
}

export async function projectAnalytics() {
  return prisma.project.findMany({ select: { id: true, slug: true, title: true, viewCount: true }, orderBy: [{ viewCount: "desc" }, { title: "asc" }] });
}

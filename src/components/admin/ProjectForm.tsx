"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Upload } from "lucide-react";
import { adminRequest } from "@/lib/admin-client";
import { toast, toastError } from "@/components/admin/toast";
import type { DonprodProject } from "@/types/donprod";
import { ProjectPreview } from "@/components/admin/ProjectPreview";

type MediaKind = "image" | "video";
type UploadResult = { url: string; publicId: string };

interface Credit {
  label: string;
  value: string;
}

interface Still {
  imageUrl: string;
  publicId?: string | null;
}

type ContentKey = "rollingTitle" | "splitQuote" | "minorQuote" | "lastQuote" | "heroQuote";
type ContentDraft = { first: string; second: string };

interface ProjectDraft {
  slug: string;
  title: string;
  artist: string;
  tags: string;
  description: string;
  dateLabel: string;
  runtimeSeconds: string;
  locations: string;
  coordinates: string;
  keywords: string;
  aspectRatio: string;
  visibility: "VISIBLE" | "HIDDEN";
  videoType: "" | "YOUTUBE" | "CLOUDINARY" | "VIMEO";
  videoUrl: string;
  videoPublicId: string;
  thumbnailDesktopUrl: string;
  thumbnailDesktopPublicId: string;
  thumbnailMobileUrl: string;
  thumbnailMobilePublicId: string;
  thumbnailPlaceholderUrl: string;
  thumbnailPlaceholderPublicId: string;
  mobilePreviewUrl: string;
  seoTitle: string;
  seoDescription: string;
  ogImageUrl: string;
  content: Record<ContentKey, ContentDraft>;
  credits: Credit[];
  stills: Still[];
}

const emptyContent: Record<ContentKey, ContentDraft> = {
  rollingTitle: { first: "", second: "" },
  splitQuote: { first: "", second: "" },
  minorQuote: { first: "", second: "" },
  lastQuote: { first: "", second: "" },
  heroQuote: { first: "", second: "" },
};

const emptyDraft: ProjectDraft = {
  slug: "", title: "", artist: "", tags: "", description: "", dateLabel: "", runtimeSeconds: "", locations: "", coordinates: "", keywords: "", aspectRatio: "1.7778", visibility: "HIDDEN",
  videoType: "", videoUrl: "", videoPublicId: "", thumbnailDesktopUrl: "", thumbnailDesktopPublicId: "", thumbnailMobileUrl: "", thumbnailMobilePublicId: "", thumbnailPlaceholderUrl: "", thumbnailPlaceholderPublicId: "", mobilePreviewUrl: "", seoTitle: "", seoDescription: "", ogImageUrl: "", content: emptyContent, credits: [], stills: [],
};

function toList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div><h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>{description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}</div><div className="grid gap-5 md:grid-cols-2">{children}</div></section>;
}

function toDraft(project: DonprodProject): ProjectDraft {
  const credits = Object.entries(project.credits ?? {}).map(([label, value]) => ({ label, value }));
  return {
    ...emptyDraft,
    slug: project.slug,
    title: project.title,
    artist: project.artist ?? "",
    tags: project.tags.filter((tag): tag is string => typeof tag === "string").join(", "),
    description: project.description ?? "",
    dateLabel: project.meta?.date ?? "",
    runtimeSeconds: project.meta?.runTime ? String((project.meta.runTime[0] * 60) + project.meta.runTime[1]) : "",
    locations: Array.isArray(project.meta?.location) ? project.meta.location.join(", ") : project.meta?.location ?? "",
    coordinates: project.meta?.coords?.join(", ") ?? "",
    keywords: project.keywords?.join(", ") ?? "",
    aspectRatio: String(project.aspectRatio ?? 1.7778),
    visibility: project.visibility ?? "HIDDEN",
    videoType: project.videoType ?? "",
    videoUrl: project.videoUrl ?? "",
    videoPublicId: project.videoPublicId ?? "",
    thumbnailDesktopUrl: project.thumbDesktop ?? "",
    thumbnailDesktopPublicId: project.thumbnailDesktopPublicId ?? "",
    thumbnailMobileUrl: project.thumbMobile ?? "",
    thumbnailMobilePublicId: project.thumbnailMobilePublicId ?? "",
    thumbnailPlaceholderUrl: project.thumbPlaceholder ?? "",
    thumbnailPlaceholderPublicId: project.thumbnailPlaceholderPublicId ?? "",
    mobilePreviewUrl: project.mobileVideo ?? "",
    seoTitle: project.seoTitle ?? "",
    seoDescription: project.seoDescription ?? "",
    ogImageUrl: project.ogImageUrl ?? "",
    content: Object.fromEntries((Object.keys(emptyContent) as ContentKey[]).map((key) => [key, { first: project.content?.[key]?.[0] ?? "", second: project.content?.[key]?.[1] ?? "" }])) as Record<ContentKey, ContentDraft>,
    credits,
    stills: project.stills.map((still) => ({ imageUrl: still.backgroundImage, publicId: still.publicId })),
  };
}

function toPreviewProject(draft: ProjectDraft): DonprodProject {
  const videoUrl = draft.videoUrl.trim() || null;
  const runtimeSeconds = Number(draft.runtimeSeconds) || 0;
  const locations = toList(draft.locations);
  const coordinates = toList(draft.coordinates);

  return {
    slug: draft.slug.trim().toLowerCase(),
    title: draft.title.trim() || "Untitled project",
    artist: draft.artist.trim() || null,
    feature: null,
    vimeo: videoUrl ?? "",
    videoType: draft.videoType || null,
    videoUrl,
    videoPublicId: draft.videoPublicId.trim() || null,
    aspectRatio: Number(draft.aspectRatio) || 1.7778,
    tags: toList(draft.tags),
    credits: Object.fromEntries(draft.credits.filter((credit) => credit.label && credit.value).map((credit) => [credit.label, credit.value])),
    meta: {
      date: draft.dateLabel.trim(),
      runTime: [Math.floor(runtimeSeconds / 60), runtimeSeconds % 60],
      location: locations.length <= 1 ? (locations[0] ?? "") : locations,
      coords: coordinates.length ? coordinates : null,
    },
    description: draft.description.trim(),
    keywords: toList(draft.keywords),
    content: Object.fromEntries((Object.keys(draft.content) as ContentKey[]).map((key) => [key, [draft.content[key].first, draft.content[key].second]])) as DonprodProject["content"],
    thumbnails: {
      placeholder: draft.thumbnailPlaceholderUrl,
      mobile: draft.thumbnailMobileUrl,
      laptop: draft.thumbnailDesktopUrl,
      desktop: draft.thumbnailDesktopUrl,
    },
    thumbMobile: draft.thumbnailMobileUrl,
    thumbDesktop: draft.thumbnailDesktopUrl,
    thumbPlaceholder: draft.thumbnailPlaceholderUrl,
    thumbnailDesktopPublicId: draft.thumbnailDesktopPublicId || null,
    thumbnailMobilePublicId: draft.thumbnailMobilePublicId || null,
    thumbnailPlaceholderPublicId: draft.thumbnailPlaceholderPublicId || null,
    mobileVideo: draft.mobilePreviewUrl,
    seoTitle: draft.seoTitle || null,
    seoDescription: draft.seoDescription || null,
    ogImageUrl: draft.ogImageUrl || null,
    visibility: draft.visibility,
    gifStyling: {
      backgroundImage: draft.thumbnailDesktopUrl,
      mobileVideo: draft.mobilePreviewUrl,
    },
    stills: draft.stills.filter((still) => still.imageUrl).map((still) => ({
      backgroundImage: still.imageUrl,
      placeholder: "",
      publicId: still.publicId,
    })),
    numberStills: draft.stills.length,
  };
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="grid gap-2 text-sm font-medium text-slate-700">{label}{children}{hint ? <span className="text-xs font-normal text-slate-500">{hint}</span> : null}</label>;
}

function inputClassName() {
  return "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#465fff] focus:bg-white focus:ring-2 focus:ring-indigo-100";
}

export function ProjectForm({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState<ProjectDraft>(emptyDraft);
  const [loading, setLoading] = useState(Boolean(projectId));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [previewProject, setPreviewProject] = useState<DonprodProject | null>(null);

  useEffect(() => {
    if (!projectId) return;
    adminRequest<DonprodProject>(`/api/admin/projects/${projectId}`).then((project) => setDraft(toDraft(project))).catch((cause: unknown) => toastError(cause instanceof Error ? cause.message : "Unable to load project.")).finally(() => setLoading(false));
  }, [projectId]);

  const videoPreview = useMemo(() => {
    if (draft.videoType !== "YOUTUBE" || !draft.videoUrl) return null;
    const match = draft.videoUrl.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
    return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
  }, [draft.videoType, draft.videoUrl]);

  const update = <K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  async function upload(file: File, kind: MediaKind, apply: (result: UploadResult) => void, label: string) {
    setUploading(label);
    try {
      const data = new FormData(); data.append("file", file);
      const result = await adminRequest<UploadResult>(`/api/admin/media/upload-${kind}`, { method: "POST", body: data });
      apply(result);
      toast("Upload complete.");
    } catch (cause) {
      toastError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally { setUploading(null); }
  }

  function fileInput(kind: MediaKind, label: string, apply: (result: UploadResult) => void) {
    const accept = kind === "image" ? "image/jpeg,image/png,image/webp,image/gif" : "video/mp4,video/webm,video/quicktime";
    return <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm hover:border-[#465fff] hover:text-[#465fff]"><Upload size={14} />{uploading === label ? "Uploading…" : label}<input className="sr-only" type="file" accept={accept} disabled={Boolean(uploading)} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file, kind, apply, label); event.currentTarget.value = ""; }} /></label>;
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true);
    const video = draft.videoType ? { videoType: draft.videoType, videoUrl: draft.videoUrl || null, videoPublicId: draft.videoType === "CLOUDINARY" ? draft.videoPublicId || null : null } : { videoType: null, videoUrl: null, videoPublicId: null };
    const payload = {
      slug: draft.slug.trim().toLowerCase(), title: draft.title, artist: draft.artist || null, ...video,
      aspectRatio: Number(draft.aspectRatio) || 1.7778, dateLabel: draft.dateLabel || null, runtimeSeconds: draft.runtimeSeconds ? Number(draft.runtimeSeconds) : null,
      locations: toList(draft.locations), coordinates: toList(draft.coordinates), description: draft.description || null, keywords: toList(draft.keywords),
      thumbnailDesktopUrl: draft.thumbnailDesktopUrl || null, thumbnailDesktopPublicId: draft.thumbnailDesktopPublicId || null,
      thumbnailMobileUrl: draft.thumbnailMobileUrl || null, thumbnailMobilePublicId: draft.thumbnailMobilePublicId || null,
      thumbnailPlaceholderUrl: draft.thumbnailPlaceholderUrl || null, thumbnailPlaceholderPublicId: draft.thumbnailPlaceholderPublicId || null,
      mobilePreviewUrl: draft.mobilePreviewUrl || null, seoTitle: draft.seoTitle || null, seoDescription: draft.seoDescription || null, ogImageUrl: draft.ogImageUrl || null,
      content: Object.fromEntries((Object.keys(draft.content) as ContentKey[]).map((key) => [key, [draft.content[key].first, draft.content[key].second]])),
      visibility: draft.visibility, tags: toList(draft.tags), credits: draft.credits.filter((credit) => credit.label && credit.value), stills: draft.stills.filter((still) => still.imageUrl),
    };
    try {
      await adminRequest(projectId ? `/api/admin/projects/${projectId}` : "/api/admin/projects", { method: projectId ? "PATCH" : "POST", body: JSON.stringify(payload) });
      toast(projectId ? "Project saved." : "Project created.");
      router.push("/admin/projects"); router.refresh();
    } catch (cause) { toastError(cause instanceof Error ? cause.message : "Unable to save project."); } finally { setSaving(false); }
  }

  if (loading) return <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-sm text-slate-500">Loading project…</div>;
  return <>
    <form onSubmit={submit} className="grid max-w-6xl gap-8 pb-16">
    <Section title="Project details" description="How this project appears in lists, search, and metadata.">
      <Field label="Title"><input required className={inputClassName()} value={draft.title} onChange={(e) => update("title", e.target.value)} /></Field>
      <Field label="Slug" hint="Lowercase letters, numbers and hyphens only"><input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className={inputClassName()} value={draft.slug} onChange={(e) => update("slug", e.target.value)} /></Field>
      <Field label="Artist"><input className={inputClassName()} value={draft.artist} onChange={(e) => update("artist", e.target.value)} /></Field>
      <Field label="Visibility"><select className={inputClassName()} value={draft.visibility} onChange={(e) => update("visibility", e.target.value as ProjectDraft["visibility"])}><option value="HIDDEN">Hidden</option><option value="VISIBLE">Visible</option></select></Field>
      <Field label="Tags" hint="Comma-separated slugs"><input className={inputClassName()} value={draft.tags} onChange={(e) => update("tags", e.target.value)} /></Field>
      <Field label="Keywords" hint="Comma-separated"><input className={inputClassName()} value={draft.keywords} onChange={(e) => update("keywords", e.target.value)} /></Field>
      <Field label="Description"><textarea className={`${inputClassName()} min-h-28`} value={draft.description} onChange={(e) => update("description", e.target.value)} /></Field>
      <div className="grid gap-5"><Field label="Date label"><input className={inputClassName()} value={draft.dateLabel} onChange={(e) => update("dateLabel", e.target.value)} /></Field><Field label="Runtime (seconds)"><input min="0" type="number" className={inputClassName()} value={draft.runtimeSeconds} onChange={(e) => update("runtimeSeconds", e.target.value)} /></Field></div>
      <Field label="Locations" hint="Comma-separated"><input className={inputClassName()} value={draft.locations} onChange={(e) => update("locations", e.target.value)} /></Field>
      <Field label="Coordinates" hint="Comma-separated"><input className={inputClassName()} value={draft.coordinates} onChange={(e) => update("coordinates", e.target.value)} /></Field>
      <Field label="Aspect ratio"><input required min="0.1" step="0.0001" type="number" className={inputClassName()} value={draft.aspectRatio} onChange={(e) => update("aspectRatio", e.target.value)} /></Field>
    </Section>
    <Section title="Video" description="Choose one source. Uploaded video URLs are saved automatically.">
      <Field label="Source"><select className={inputClassName()} value={draft.videoType} onChange={(e) => update("videoType", e.target.value as ProjectDraft["videoType"])}><option value="">No video</option><option value="YOUTUBE">YouTube</option><option value="VIMEO">Vimeo</option><option value="CLOUDINARY">Cloudinary</option></select></Field>
      {draft.videoType === "YOUTUBE" ? <Field label="YouTube URL"><input type="url" className={inputClassName()} value={draft.videoUrl} onChange={(e) => update("videoUrl", e.target.value)} /></Field> : null}
      {draft.videoType === "VIMEO" ? <Field label="Vimeo URL"><input type="url" className={inputClassName()} value={draft.videoUrl} onChange={(e) => update("videoUrl", e.target.value)} /></Field> : null}
      {draft.videoType === "CLOUDINARY" ? <div className="grid gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Cloudinary video</span>{fileInput("video", "Upload video", (result) => setDraft((current) => ({ ...current, videoUrl: result.url, videoPublicId: result.publicId })))}{draft.videoUrl ? <video className="max-h-72 w-full overflow-hidden rounded-xl border border-slate-200 bg-black" controls src={draft.videoUrl} /> : <span className="text-xs text-slate-500">No uploaded video selected.</span>}</div> : null}
      {videoPreview ? <iframe className="aspect-video w-full overflow-hidden rounded-xl border border-slate-200 bg-black md:col-span-2" src={videoPreview} title="YouTube video preview" allowFullScreen /> : null}
    </Section>
    <Section title="Project copy">
      {(Object.keys(emptyContent) as ContentKey[]).map((key) => <div key={key} className="grid gap-3 md:col-span-2 md:grid-cols-2"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 md:col-span-2">{key.replace(/([A-Z])/g, " $1")}</span><input aria-label={`${key} first line`} className={inputClassName()} placeholder="First line" value={draft.content[key].first} onChange={(e) => update("content", { ...draft.content, [key]: { ...draft.content[key], first: e.target.value } })} /><input aria-label={`${key} second line`} className={inputClassName()} placeholder="Second line" value={draft.content[key].second} onChange={(e) => update("content", { ...draft.content, [key]: { ...draft.content[key], second: e.target.value } })} /></div>)}
    </Section>
    <Section title="Thumbnails & gallery" description="Upload real thumbnails and gallery images. Mobile preview and OG URLs stay manual.">
      {(["thumbnailDesktop", "thumbnailMobile", "thumbnailPlaceholder"] as const).map((key) => { const urlKey = `${key}Url` as keyof ProjectDraft; const idKey = `${key}PublicId` as keyof ProjectDraft; const imageUrl = draft[urlKey]; return <div key={key} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{key.replace("thumbnail", "").replace(/([A-Z])/g, " $1") || "Desktop"}</span><div className="flex flex-wrap gap-2">{fileInput("image", "Upload image", (result) => setDraft((current) => ({ ...current, [urlKey]: result.url, [idKey]: result.publicId })))}{typeof imageUrl === "string" && imageUrl ? <button type="button" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 hover:border-slate-300" onClick={() => setDraft((current) => ({ ...current, [urlKey]: "", [idKey]: "" }))}>Remove image</button> : null}</div>{typeof imageUrl === "string" && imageUrl ? <div className="aspect-video overflow-hidden rounded-xl border border-slate-200 bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} /> : <span className="text-xs text-slate-500">No image selected.</span>}</div>; })}
      <div className="grid gap-3"><Field label="Mobile preview URL" hint="Paste a URL or upload a mobile video"><input type="url" className={inputClassName()} value={draft.mobilePreviewUrl} onChange={(e) => update("mobilePreviewUrl", e.target.value)} /></Field><div className="flex flex-wrap items-center gap-2">{fileInput("video", "Upload mobile video", (result) => update("mobilePreviewUrl", result.url))}{draft.mobilePreviewUrl ? <button type="button" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 hover:border-slate-300" onClick={() => update("mobilePreviewUrl", "")}>Remove video</button> : null}</div></div>
      <Field label="OG image URL"><input type="url" className={inputClassName()} value={draft.ogImageUrl} onChange={(e) => update("ogImageUrl", e.target.value)} /></Field>
      <div className="md:col-span-2 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Gallery stills</span>{fileInput("image", "Add still", (result) => update("stills", [...draft.stills, { imageUrl: result.url, publicId: result.publicId }]))}</div><div className="grid gap-3 sm:grid-cols-3">{draft.stills.length ? draft.stills.map((still, index) => <div key={`${still.imageUrl}-${index}`} className="relative aspect-video overflow-hidden rounded-xl border border-slate-200 bg-cover bg-center" style={{ backgroundImage: `url(${still.imageUrl})` }}><button type="button" aria-label="Remove still" className="absolute right-2 top-2 rounded-full bg-slate-900/80 p-2 text-white" onClick={() => update("stills", draft.stills.filter((_, stillIndex) => stillIndex !== index))}><Trash2 size={14} /></button></div>) : <span className="text-xs text-slate-500">No gallery stills yet.</span>}</div></div>
    </Section>
    <Section title="Credits & SEO">
      <div className="md:col-span-2 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">{draft.credits.map((credit, index) => <div key={index} className="grid gap-3 md:grid-cols-[1fr_2fr_auto]"><input aria-label="Credit label" placeholder="Credit label" className={inputClassName()} value={credit.label} onChange={(e) => update("credits", draft.credits.map((item, itemIndex) => itemIndex === index ? { ...item, label: e.target.value } : item))} /><input aria-label="Credit value" placeholder="Credit value" className={inputClassName()} value={credit.value} onChange={(e) => update("credits", draft.credits.map((item, itemIndex) => itemIndex === index ? { ...item, value: e.target.value } : item))} /><button type="button" aria-label="Remove credit" className="rounded-xl border border-slate-200 bg-white px-3 text-slate-500 hover:border-red-300 hover:text-red-600" onClick={() => update("credits", draft.credits.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={15} /></button></div>)}<button type="button" className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 hover:border-slate-300" onClick={() => update("credits", [...draft.credits, { label: "", value: "" }])}><Plus size={14} />Add credit</button></div>
      <Field label="SEO title"><input className={inputClassName()} value={draft.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} /></Field><Field label="SEO description"><textarea className={`${inputClassName()} min-h-24`} value={draft.seoDescription} onChange={(e) => update("seoDescription", e.target.value)} /></Field>
    </Section>
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><button disabled={saving || Boolean(uploading)} className="rounded-xl bg-[#465fff] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#3a4fe6] disabled:opacity-50" type="submit">{saving ? "Saving…" : projectId ? "Save changes" : "Create project"}</button><button type="button" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => setPreviewProject(toPreviewProject(draft))}>Preview</button><button type="button" className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700" onClick={() => router.push("/admin/projects")}>Cancel</button>{uploading ? <span className="text-xs text-slate-500">{uploading} in progress…</span> : null}</div>
  </form>{previewProject ? <ProjectPreview project={previewProject} onClose={() => setPreviewProject(null)} /> : null}
  </>;
}

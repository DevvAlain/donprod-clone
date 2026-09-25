"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Save, Trash2, Upload } from "lucide-react";
import { adminRequest } from "@/lib/admin-client";
import { toast, toastError } from "@/components/admin/toast";

/* eslint-disable @next/next/no-img-element */

interface SocialLink {
  label: string;
  url: string;
}

interface BtsImage {
  imageUrl: string;
  publicId?: string | null;
}

interface ContactSettings {
  readyText: string;
  designerLabel: string;
  designerUrl: string;
  locationName: string;
  locationAddress: string;
  coordinates: string;
  footerBrand: string;
  footerDescription: string;
  copyrightYear: string;
  showreelUrl: string;
  introVideoUrl: string;
  tickerText: string;
  socialLinks: SocialLink[];
  btsImages: BtsImage[];
}

type UploadResult = { url: string; publicId: string };
type UploadKind = "image" | "video";

const emptySettings: ContactSettings = {
  readyText: "",
  designerLabel: "",
  designerUrl: "",
  locationName: "",
  locationAddress: "",
  coordinates: "",
  footerBrand: "",
  footerDescription: "",
  copyrightYear: "",
  showreelUrl: "",
  introVideoUrl: "",
  tickerText: "",
  socialLinks: [],
  btsImages: [],
};

const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#465fff] focus:bg-white focus:ring-2 focus:ring-indigo-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-2 text-sm font-medium text-slate-700">{label}{children}</label>;
}

function UploadButton({ kind, label, disabled, onUpload }: { kind: UploadKind; label: string; disabled: boolean; onUpload: (file: File) => void }) {
  const accept = kind === "image" ? "image/jpeg,image/png,image/webp,image/gif" : "video/mp4,video/webm,video/quicktime";
  return <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:border-[#465fff] hover:text-[#465fff] ${disabled ? "cursor-wait opacity-60" : ""}`}><Upload size={14} />{label}<input className="sr-only" type="file" accept={accept} disabled={disabled} onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); event.currentTarget.value = ""; }} /></label>;
}

export function ContactManager() {
  const [settings, setSettings] = useState<ContactSettings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<UploadKind | null>(null);

  useEffect(() => {
    void adminRequest<ContactSettings>("/api/admin/contact")
      .then((data) => setSettings({ ...emptySettings, ...data }))
      .catch((cause: unknown) => toastError(cause instanceof Error ? cause.message : "Unable to load contact settings."))
      .finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof ContactSettings>(key: K, value: ContactSettings[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  async function upload(file: File, kind: UploadKind, apply: (result: UploadResult) => void) {
    setUploading(kind);
    try {
      const body = new FormData();
      body.append("file", file);
      apply(await adminRequest<UploadResult>(`/api/admin/media/upload-${kind}`, { method: "POST", body }));
      toast(`${kind === "image" ? "Image" : "Video"} uploaded. Save settings to persist it.`);
    } catch (cause) {
      toastError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await adminRequest<ContactSettings>("/api/admin/contact", {
        method: "PATCH",
        body: JSON.stringify(settings),
      });
      toast("Contact settings saved.");
    } catch (cause) {
      toastError(cause instanceof Error ? cause.message : "Unable to save contact settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="grid min-h-[40vh] place-items-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-500">Loading contact settings</div>;

  return <form onSubmit={submit} className="grid max-w-6xl gap-6 pb-16">
    <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:grid-cols-2">
      <div className="md:col-span-2"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Contact page</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Page content</h2></div>
      <Field label="Ready heading"><input required className={inputClass} value={settings.readyText} onChange={(event) => update("readyText", event.target.value)} /></Field>
      <Field label="Designer label"><input required className={inputClass} value={settings.designerLabel} onChange={(event) => update("designerLabel", event.target.value)} /></Field>
      <Field label="Designer URL"><input required type="url" className={inputClass} value={settings.designerUrl} onChange={(event) => update("designerUrl", event.target.value)} /></Field>
      <Field label="Location name"><input required className={inputClass} value={settings.locationName} onChange={(event) => update("locationName", event.target.value)} /></Field>
      <Field label="Location address"><input required className={inputClass} value={settings.locationAddress} onChange={(event) => update("locationAddress", event.target.value)} /></Field>
      <Field label="Coordinates"><input required className={inputClass} value={settings.coordinates} onChange={(event) => update("coordinates", event.target.value)} /></Field>
      <Field label="Ticker text"><input required className={inputClass} value={settings.tickerText} onChange={(event) => update("tickerText", event.target.value)} /></Field>
    </section>

    <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:grid-cols-2">
      <div className="md:col-span-2"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Showreel</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Video source</h2><p className="mt-1 text-sm text-slate-500">Paste a Vimeo URL or upload a real video file to Cloudinary.</p></div>
      <Field label="Showreel URL"><input required type="url" className={inputClass} value={settings.showreelUrl} onChange={(event) => update("showreelUrl", event.target.value)} /></Field>
      <div className="grid content-end gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Local file upload</span><div className="flex flex-wrap items-center gap-3"><UploadButton kind="video" label={uploading === "video" ? "Uploading…" : "Upload showreel"} disabled={Boolean(uploading)} onUpload={(file) => void upload(file, "video", (result) => update("showreelUrl", result.url))} />{settings.showreelUrl ? <a className="truncate text-xs text-[#465fff] hover:underline" href={settings.showreelUrl} target="_blank" rel="noreferrer">Open current video</a> : null}</div></div>
    </section>

    <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:grid-cols-2">
      <div className="md:col-span-2"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Intro</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Background video</h2><p className="mt-1 text-sm text-slate-500">Loops under the I8 STUDIOVN letter loader. Upload a real mp4/webm, or leave empty for a black intro.</p></div>
      <Field label="Intro video URL"><input type="url" className={inputClass} value={settings.introVideoUrl} onChange={(event) => update("introVideoUrl", event.target.value)} placeholder="https://…" /></Field>
      <div className="grid content-end gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Local file upload</span><div className="flex flex-wrap items-center gap-3"><UploadButton kind="video" label={uploading === "video" ? "Uploading…" : "Upload intro video"} disabled={Boolean(uploading)} onUpload={(file) => void upload(file, "video", (result) => update("introVideoUrl", result.url))} />{settings.introVideoUrl ? <a className="truncate text-xs text-[#465fff] hover:underline" href={settings.introVideoUrl} target="_blank" rel="noreferrer">Open current video</a> : null}</div></div>
      {settings.introVideoUrl ? <video className="md:col-span-2 max-h-56 w-full rounded-xl bg-black object-cover" src={settings.introVideoUrl} muted playsInline controls /> : null}
    </section>

    <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 md:grid-cols-2">
      <div className="md:col-span-2"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Footer</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Brand and legal copy</h2></div>
      <Field label="Footer brand"><input required className={inputClass} value={settings.footerBrand} onChange={(event) => update("footerBrand", event.target.value)} /></Field>
      <Field label="Copyright year"><input required pattern="[0-9]{4}" className={inputClass} value={settings.copyrightYear} onChange={(event) => update("copyrightYear", event.target.value)} /></Field>
      <Field label="Footer description"><input required className={inputClass} value={settings.footerDescription} onChange={(event) => update("footerDescription", event.target.value)} /></Field>
    </section>

    <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Links</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Social links</h2></div><button type="button" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 hover:border-slate-300" onClick={() => update("socialLinks", [...settings.socialLinks, { label: "", url: "" }])}><Plus size={14} />Add link</button></div>
      {settings.socialLinks.map((link, index) => <div key={index} className="grid gap-3 md:grid-cols-[1fr_2fr_auto]"><input aria-label="Social label" placeholder="Label" className={inputClass} value={link.label} onChange={(event) => update("socialLinks", settings.socialLinks.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} /><input aria-label="Social URL" placeholder="https://… or mailto:…" type="url" className={inputClass} value={link.url} onChange={(event) => update("socialLinks", settings.socialLinks.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item))} /><button type="button" aria-label="Remove social link" className="rounded-xl border border-slate-200 px-3 text-slate-500 hover:border-red-300 hover:text-red-600" onClick={() => update("socialLinks", settings.socialLinks.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={15} /></button></div>)}
    </section>

    <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Media</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Behind-the-scenes stills</h2><p className="mt-1 text-sm text-slate-500">Add an image URL or upload a real image file.</p></div><div className="flex flex-wrap gap-2"><UploadButton kind="image" label={uploading === "image" ? "Uploading…" : "Upload image"} disabled={Boolean(uploading)} onUpload={(file) => void upload(file, "image", (result) => update("btsImages", [...settings.btsImages, { imageUrl: result.url, publicId: result.publicId }]))} /><button type="button" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 hover:border-slate-300" onClick={() => update("btsImages", [...settings.btsImages, { imageUrl: "" }])}><Plus size={14} />Add URL</button></div></div>
      {settings.btsImages.length ? settings.btsImages.map((image, index) => <div key={index} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[96px_1fr_auto] md:items-center"><div className="aspect-video overflow-hidden rounded-lg bg-slate-200">{image.imageUrl ? <img src={image.imageUrl} alt={`BTS still ${index + 1}`} className="h-full w-full object-cover" /> : null}</div><input aria-label="BTS image URL" placeholder="https://…" type="url" className={inputClass} value={image.imageUrl} onChange={(event) => update("btsImages", settings.btsImages.map((item, itemIndex) => itemIndex === index ? { ...item, imageUrl: event.target.value } : item))} /><button type="button" aria-label="Remove BTS image" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-500 hover:border-red-300 hover:text-red-600" onClick={() => update("btsImages", settings.btsImages.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={15} /></button></div>) : <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">No BTS stills added.</div>}
    </section>

    <div className="flex items-center gap-3"><button disabled={saving || Boolean(uploading)} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#465fff] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#3a4fe6] disabled:opacity-50"><Save size={15} />{saving ? "Saving…" : "Save contact settings"}</button>{uploading ? <span className="text-xs text-slate-500">Upload in progress…</span> : null}</div>
  </form>;
}

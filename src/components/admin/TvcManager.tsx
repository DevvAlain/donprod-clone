"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Plus, Save, Trash2, Upload } from "lucide-react";
import { adminRequest } from "@/lib/admin-client";
import { toast, toastError } from "@/components/admin/toast";

/* eslint-disable @next/next/no-img-element */

type TvcType = "HIGHLIGHTED" | "CSR";

interface TvcItem {
  id: string;
  type: TvcType;
  title: string;
  description: string | null;
  imageUrl: string | null;
  imagePublicId?: string | null;
  displayOrder: number;
}

type UploadResult = { url: string; publicId: string };

const emptyDraft: Omit<TvcItem, "id" | "displayOrder"> = {
  type: "HIGHLIGHTED",
  title: "",
  description: "",
  imageUrl: null,
  imagePublicId: null,
};

const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#465fff] focus:bg-white focus:ring-2 focus:ring-indigo-100";

export function TvcManager() {
  const [items, setItems] = useState<TvcItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | "new" | null>("new");
  const [draft, setDraft] = useState(emptyDraft);
  const [filter, setFilter] = useState<"ALL" | TvcType>("ALL");

  const shown = useMemo(
    () => items.filter((item) => filter === "ALL" || item.type === filter),
    [items, filter],
  );

  function load() {
    void adminRequest<TvcItem[]>("/api/admin/tvc")
      .then(setItems)
      .catch((cause: unknown) => toastError(cause instanceof Error ? cause.message : "Unable to load TVC items."))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function startCreate() {
    setEditingId("new");
    setDraft(emptyDraft);
  }

  function startEdit(item: TvcItem) {
    setEditingId(item.id);
    setDraft({
      type: item.type,
      title: item.title,
      description: item.description ?? "",
      imageUrl: item.imageUrl,
      imagePublicId: item.imagePublicId ?? null,
    });
  }

  async function upload(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const result = await adminRequest<UploadResult>("/api/admin/media/upload-image", { method: "POST", body });
      setDraft((current) => ({ ...current, imageUrl: result.url, imagePublicId: result.publicId }));
      toast("Image uploaded. Save to persist it.");
    } catch (cause) {
      toastError(cause instanceof Error ? cause.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const payload = {
      type: draft.type,
      title: draft.title,
      description: draft.description?.trim() ? draft.description : null,
      imageUrl: draft.imageUrl,
      imagePublicId: draft.imagePublicId,
    };
    try {
      if (editingId && editingId !== "new") {
        const updated = await adminRequest<TvcItem>(`/api/admin/tvc/${editingId}`, { method: "PATCH", body: JSON.stringify(payload) });
        setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
        toast("TVC item saved.");
      } else {
        const created = await adminRequest<TvcItem>("/api/admin/tvc", { method: "POST", body: JSON.stringify(payload) });
        setItems((current) => [...current, created]);
        setEditingId(created.id);
        toast("TVC item created.");
      }
    } catch (cause) {
      toastError(cause instanceof Error ? cause.message : "Unable to save TVC item.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this TVC item?")) return;
    try {
      await adminRequest(`/api/admin/tvc/${id}`, { method: "DELETE" });
      setItems((current) => current.filter((item) => item.id !== id));
      if (editingId === id) startCreate();
      toast("TVC item deleted.");
    } catch (cause) {
      toastError(cause instanceof Error ? cause.message : "Unable to delete TVC item.");
    }
  }

  async function move(id: string, direction: -1 | 1) {
    const index = items.findIndex((item) => item.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return;
    const next = [...items];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    setItems(next);
    try {
      await adminRequest("/api/admin/tvc/reorder", { method: "PATCH", body: JSON.stringify({ itemIds: next.map((entry) => entry.id) }) });
    } catch (cause) {
      toastError(cause instanceof Error ? cause.message : "Unable to reorder.");
      load();
    }
  }

  if (loading) return <div className="grid min-h-[40vh] place-items-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-500">Loading TVC items</div>;

  return <div className="grid gap-6 pb-16 xl:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Public /tvc</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">Milestones</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["ALL", "HIGHLIGHTED", "CSR"] as const).map((value) => (
            <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-xl px-3 py-2 text-xs font-medium ${filter === value ? "bg-[#465fff] text-white" : "border border-slate-200 text-slate-600"}`}>{value === "ALL" ? "All" : value === "HIGHLIGHTED" ? "Highlighted" : "CSR"}</button>
          ))}
          <button type="button" onClick={startCreate} className="inline-flex items-center gap-2 rounded-xl bg-[#465fff] px-3 py-2 text-xs font-medium text-white"><Plus size={14} />New</button>
        </div>
      </div>
      {shown.length === 0 ? <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">No TVC items yet</div> : (
        <ul className="grid gap-3">
          {shown.map((item) => (
            <li key={item.id} className={`grid grid-cols-[88px_1fr_auto] items-center gap-3 rounded-xl border p-3 ${editingId === item.id ? "border-[#465fff] bg-indigo-50/40" : "border-slate-200"}`}>
              <div className="h-14 overflow-hidden rounded-lg bg-slate-100">{item.imageUrl ? <img src={item.imageUrl} alt="" className="h-full w-full object-cover" /> : null}</div>
              <button type="button" className="min-w-0 text-left" onClick={() => startEdit(item)}>
                <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">{item.type}</p>
              </button>
              <div className="flex items-center gap-1">
                <button type="button" className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500" onClick={() => void move(item.id, -1)} aria-label="Move up">↑</button>
                <button type="button" className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500" onClick={() => void move(item.id, 1)} aria-label="Move down">↓</button>
                <button type="button" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-red-300 hover:text-red-600" onClick={() => void remove(item.id)} aria-label={`Delete ${item.title}`}><Trash2 size={14} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>

    <form onSubmit={submit} className="grid h-fit gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{editingId && editingId !== "new" ? "Edit item" : "New item"}</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">TVC entry</h2>
      </div>
      <label className="grid gap-2 text-sm font-medium text-slate-700">Tab
        <select className={inputClass} value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as TvcType }))}>
          <option value="HIGHLIGHTED">Highlighted project</option>
          <option value="CSR">CSR project</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">Title
        <input required className={inputClass} value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">Description
        <textarea rows={8} className={inputClass} value={draft.description ?? ""} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
      </label>
      <div className="grid gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Poster</span>
        {draft.imageUrl ? <img src={draft.imageUrl} alt="" className="max-h-48 w-full rounded-lg object-cover" /> : null}
        <div className="flex flex-wrap items-center gap-3">
          <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 ${uploading ? "opacity-60" : ""}`}>
            <Upload size={14} />{uploading ? "Uploading…" : "Upload image"}
            <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.currentTarget.value = ""; }} />
          </label>
          {draft.imageUrl ? <button type="button" className="text-xs text-slate-500 underline" onClick={() => setDraft((current) => ({ ...current, imageUrl: null, imagePublicId: null }))}>Remove</button> : null}
        </div>
      </div>
      <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#465fff] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#3a4fe6] disabled:opacity-60"><Save size={16} />{saving ? "Saving…" : "Save"}</button>
    </form>
  </div>;
}

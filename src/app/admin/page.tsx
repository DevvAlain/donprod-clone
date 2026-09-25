"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminRequest } from "@/lib/admin-client";
import type { DonprodProject } from "@/types/donprod";

export default function AdminDashboardPage() {
  const [projects, setProjects] = useState<DonprodProject[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void adminRequest<DonprodProject[]>("/api/admin/projects").then(setProjects).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Something went wrong.")); }, []);
  const totalViews = projects?.reduce((sum, project) => sum + (project.viewCount ?? 0), 0) ?? 0;
  const metrics = projects ? [
    ["Total projects", projects.length], ["Visible", projects.filter((project) => project.visibility === "VISIBLE").length], ["Hidden", projects.filter((project) => project.visibility === "HIDDEN").length], ["Project views", totalViews],
  ] : [];
  return <AdminShell title="Dashboard" actions={<Link href="/admin/projects/new" className="inline-flex items-center gap-2 rounded-xl bg-[#465fff] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#3a4fe6]"><Plus size={16} />New project</Link>}>
    {error ? <State message={error} /> : !projects ? <State message="Loading dashboard" /> : projects.length === 0 ? <Empty /> : <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p><p className="mt-4 font-[family-name:var(--font-punchy)] text-4xl tracking-[-0.06em] text-slate-900">{value}</p></div>)}</section>
      <section className="mt-8"><div className="mb-4 flex items-baseline justify-between"><h2 className="text-sm font-semibold tracking-tight text-slate-900">Recent projects</h2><Link href="/admin/projects" className="text-xs font-medium text-slate-500 hover:text-slate-900">View all</Link></div><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">{projects.slice(0, 6).map((project) => <Link href={`/admin/projects/${project.id}`} key={project.id} className="grid grid-cols-[56px_1fr_auto] items-center gap-4 border-b border-slate-100 p-4 last:border-0 hover:bg-slate-50"><div className="h-10 rounded-lg bg-slate-100" style={{ background: project.thumbDesktop ? `center / cover url(${project.thumbDesktop})` : undefined }} /><div><p className="text-sm font-medium text-slate-900">{project.title}</p><p className="text-xs text-slate-500">{project.artist || "No artist"}</p></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${project.visibility === "VISIBLE" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"}`}>{project.visibility}</span></Link>)}</div></section>
    </>}
  </AdminShell>;
}

function State({ message }: { message: string }) { return <div className="grid min-h-[40vh] place-items-center rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-sm text-slate-500">{message}</div>; }
function Empty() { return <div className="grid min-h-[45vh] place-items-center rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm"><div><p className="font-[family-name:var(--font-punchy)] text-4xl tracking-[-0.07em] text-slate-900">No projects yet</p><p className="mt-3 text-sm text-slate-500">Start with your first real project.</p><Link href="/admin/projects/new" className="mt-6 inline-flex rounded-xl bg-[#465fff] px-4 py-3 text-sm font-medium text-white hover:bg-[#3a4fe6]">Create your first project</Link></div></div>; }

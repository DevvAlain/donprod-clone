"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Clapperboard, FileText, FolderKanban, LayoutDashboard, LogOut, Menu, Settings, X } from "lucide-react";
import { adminRequest } from "@/lib/admin-client";
import { AdminToasts } from "@/components/admin/toast";

const navigation = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/contact", label: "Contact", icon: FileText },
  { href: "/admin/tvc", label: "TVC", icon: Clapperboard },
];

export function AdminShell({ children, title, actions }: { children: React.ReactNode; title: string; actions?: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void adminRequest<{ email: string }>("/api/auth/me")
      .then(() => setReady(true))
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  if (!ready) return <main className="grid min-h-screen place-items-center bg-[#f7f8fa] font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">Loading CMS</main>;

  const sidebar = (
    <aside className="flex h-full w-[280px] flex-col bg-[#111827] px-5 py-6 text-white">
      <Link href="/admin" className="mb-12 block font-[family-name:var(--font-punchy)] text-3xl tracking-[-0.08em]">
        I8<span className="text-slate-500">/CMS</span>
      </Link>
      <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace</div>
      <nav className="space-y-1" aria-label="Admin navigation">
        {navigation.map(({ href, label, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${active ? "bg-[#465fff] text-white shadow-lg shadow-indigo-950/30" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}><Icon size={17} />{label}</Link>;
        })}
      </nav>
      <div className="mt-auto border-t border-white/10 pt-5">
        <div className="mb-3 flex items-center gap-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500"><Settings size={14} />System</div>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-400 transition hover:bg-white/10 hover:text-white"><LogOut size={17} />Logout</button>
      </div>
    </aside>
  );

  return <div className="min-h-screen bg-[#f7f8fa] text-slate-800">
    <div className="hidden min-h-screen md:fixed md:inset-y-0 md:left-0 md:block">{sidebar}</div>
    <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between border-b border-slate-200 bg-[#f7f8fa]/95 px-4 backdrop-blur sm:px-6 md:ml-[280px] md:px-10">
      <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-600 hover:bg-white md:hidden" aria-label="Open navigation"><Menu size={20} /></button>
      <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">I8 CMS</p><h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{title}</h1></div>
      <div>{actions}</div>
    </header>
    {open && <div className="fixed inset-0 z-50 bg-slate-950/60 md:hidden"><div className="relative h-full w-[280px]"><button onClick={() => setOpen(false)} className="absolute right-4 top-5 z-10 rounded-lg p-2 text-white" aria-label="Close navigation"><X size={20} /></button>{sidebar}</div></div>}
    <main className="p-4 sm:p-6 md:ml-[280px] md:p-10">{children}</main>
    <AdminToasts />
  </div>;
}

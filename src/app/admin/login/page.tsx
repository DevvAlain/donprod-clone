"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminRequest } from "@/lib/admin-client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  useEffect(() => { void adminRequest("/api/auth/me").then(() => router.replace("/admin")).catch(() => undefined); }, [router]);
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(""); setLoading(true); try { await adminRequest("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }); router.replace("/admin"); } catch { setError("Unable to sign in. Check your details and try again."); } finally { setLoading(false); } };
  return <main className="grid min-h-screen place-items-center bg-black p-5 text-[#f6f6f6]"><form onSubmit={submit} className="w-full max-w-sm border border-white/20 p-6 md:p-8"><p className="font-[family-name:var(--font-punchy)] text-5xl tracking-[-0.08em]">DN-PRD</p><p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#868686]">Internal CMS</p><div className="mt-10 space-y-5"><label className="block font-mono text-[10px] uppercase tracking-[0.14em]">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full border border-white/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-white" /></label><label className="block font-mono text-[10px] uppercase tracking-[0.14em]">Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full border border-white/20 bg-transparent px-3 py-3 text-sm outline-none focus:border-white" /></label></div>{error && <p role="alert" className="mt-4 font-mono text-xs text-red-300">{error}</p>}<button disabled={loading} className="mt-7 w-full bg-white px-4 py-3 font-mono text-xs uppercase tracking-[0.14em] text-black disabled:opacity-50">{loading ? "Signing in" : "Sign in"}</button></form></main>;
}

import { success, failure } from "@/lib/api-response";
import { getContactSettings } from "@/services/contact";

export const runtime = "nodejs";

let mem: { data: Awaited<ReturnType<typeof getContactSettings>>; expires: number } | null = null;

export async function GET() {
  try {
    const now = Date.now();
    if (mem && mem.expires > now) {
      const hit = success(mem.data);
      hit.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=600");
      hit.headers.set("X-Cache", "HIT");
      return hit;
    }
    const data = await getContactSettings();
    mem = { data, expires: now + 30_000 };
    const res = success(data);
    res.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=600");
    res.headers.set("X-Cache", "MISS");
    return res;
  } catch (error) {
    console.error("Unable to load contact settings", error);
    return failure("Unable to load contact settings.", 500);
  }
}

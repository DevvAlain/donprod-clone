import { failure, success } from "@/lib/api-response";
import { listProjects } from "@/services/projects";

export const runtime = "nodejs";

let memCache: { data: Awaited<ReturnType<typeof listProjects>>; expires: number } | null = null;
const TTL_MS = 30_000;

export async function GET() {
  try {
    const now = Date.now();
    if (memCache && memCache.expires > now) {
      const res = success(memCache.data);
      res.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=600");
      res.headers.set("X-Cache", "HIT");
      return res;
    }
    const data = await listProjects();
    memCache = { data, expires: now + TTL_MS };
    const response = success(data);
    response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=600");
    response.headers.set("X-Cache", "MISS");
    return response;
  } catch (error) {
    console.error("Unable to list public projects", error);
    return failure("Unable to load projects.", 500);
  }
}

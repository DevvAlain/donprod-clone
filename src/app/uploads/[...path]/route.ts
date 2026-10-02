import { createReadStream, promises as fs } from "fs";
import path from "path";
import { uploadRootDir } from "@/lib/local-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_SUBDIR = new Set(["images", "videos"]);
const FILENAME = /^[0-9a-f-]+\.(jpg|jpeg|png|webp|gif|mp4|webm|mov)$/i;

const CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const segments = (await params).path ?? [];
  // Strict shape: /uploads/<images|videos>/<uuid>.<ext> — nothing else.
  if (segments.length !== 2) return new Response("Not found.", { status: 404 });
  const [subdir, filename] = segments;
  if (!ALLOWED_SUBDIR.has(subdir) || !FILENAME.test(filename)) {
    return new Response("Not found.", { status: 404 });
  }
  const ext = filename.split(".").pop()!.toLowerCase();
  const filePath = path.join(uploadRootDir(), subdir, filename);
  let size: number;
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) return new Response("Not found.", { status: 404 });
    size = stat.size;
  } catch {
    return new Response("Not found.", { status: 404 });
  }
  const baseHeaders = {
    "Content-Type": CONTENT_TYPE[ext] ?? "application/octet-stream",
    // Filenames are content-addressed (uuid), safe to cache hard.
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
    "Accept-Ranges": "bytes",
  };
  // Single-range support so <video> seeking works.
  const range = request.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
    if (match) {
      const start =
        match[1] === "" ? Math.max(size - Number(match[2] || 0), 0) : Number(match[1]);
      const end =
        match[2] === "" || match[1] === "" ? size - 1 : Math.min(Number(match[2]), size - 1);
      if (!Number.isNaN(start) && !Number.isNaN(end) && start <= end && start < size) {
        const stream = createReadStream(filePath, { start, end });
        return new Response(stream as unknown as BodyInit, {
          status: 206,
          headers: {
            ...baseHeaders,
            "Content-Range": `bytes ${start}-${end}/${size}`,
            "Content-Length": String(end - start + 1),
          },
        });
      }
      return new Response("Range not satisfiable.", {
        status: 416,
        headers: { ...baseHeaders, "Content-Range": `bytes */${size}` },
      });
    }
  }
  const stream = createReadStream(filePath);
  return new Response(stream as unknown as BodyInit, {
    status: 200,
    headers: { ...baseHeaders, "Content-Length": String(size) },
  });
}

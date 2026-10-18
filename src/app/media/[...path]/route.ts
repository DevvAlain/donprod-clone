import { promises as fs } from "fs";
import os from "os";
import path from "path";
import sharp from "sharp";
import { uploadRootDir } from "@/lib/local-upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Dedicated image pipeline. It lives at /media (not /uploads) so that the
// files kept in public/uploads can never be served first by Next's static
// handler and bypass the resize step.
const ALLOWED_SUBDIR = "images";
const FILENAME = /^[0-9a-f-]+\.(jpg|jpeg|png|webp|gif)$/i;
const RESIZABLE = new Set(["jpg", "jpeg", "png", "webp"]);
const ALLOWED_WIDTHS = new Set([320, 480, 640, 960, 1200, 1440, 1920]);
const CACHE_DIR = path.join(os.tmpdir(), "i8-image-cache");

function resolveFormat(value: string | null): "webp" | "avif" | null {
  if (value === "webp" || value === "avif") return value;
  return null;
}

async function renderImage(
  filePath: string,
  width: number,
  format: "webp" | "avif",
): Promise<Buffer> {
  const cacheKey = `${path.basename(filePath, path.extname(filePath))}-${width}.${format}`;
  const cachePath = path.join(CACHE_DIR, cacheKey);

  try {
    return await fs.readFile(cachePath);
  } catch {
    // not cached yet
  }

  const pipeline = sharp(filePath).rotate().resize({ width, withoutEnlargement: true });
  const output =
    format === "avif"
      ? await pipeline.avif({ quality: 60, effort: 4 }).toBuffer()
      : await pipeline.webp({ quality: 74, effort: 4 }).toBuffer();

  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(cachePath, output);
  } catch {
    // A read-only filesystem is fine: we still return the rendered bytes.
  }

  return output;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const segments = (await params).path ?? [];
  if (segments.length !== 2) return new Response("Not found.", { status: 404 });
  const [subdir, filename] = segments;
  if (subdir !== ALLOWED_SUBDIR || !FILENAME.test(filename)) {
    return new Response("Not found.", { status: 404 });
  }

  const ext = filename.split(".").pop()!.toLowerCase();
  if (!RESIZABLE.has(ext)) return new Response("Not found.", { status: 404 });

  const filePath = path.join(uploadRootDir(), subdir, filename);
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) return new Response("Not found.", { status: 404 });
  } catch {
    return new Response("Not found.", { status: 404 });
  }

  const url = new URL(request.url);
  const requestedWidth = Number(url.searchParams.get("w"));
  const width = ALLOWED_WIDTHS.has(requestedWidth) ? requestedWidth : 1920;
  const format = resolveFormat(url.searchParams.get("f")) ?? "webp";

  try {
    const rendered = await renderImage(filePath, width, format);
    return new Response(new Uint8Array(rendered), {
      status: 200,
      headers: {
        "Content-Type": format === "avif" ? "image/avif" : "image/webp",
        // Files are content-addressed (uuid) and variants are stable.
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Length": String(rendered.byteLength),
      },
    });
  } catch (error) {
    console.warn("[media] image resize failed", filename, error);
    // Last resort: hand the request back to the original file route.
    return Response.redirect(new URL(`/uploads/${subdir}/${filename}`, url), 307);
  }
}

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export type LocalUploadKind = "image" | "video";

const EXTENSIONS: Record<LocalUploadKind, string[]> = {
  image: ["jpg", "jpeg", "png", "webp", "gif"],
  video: ["mp4", "webm", "mov"],
};

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

// Absolute public origin for stored URLs. Behind Caddy (TLS-terminating
// reverse proxy) the internal request is plain HTTP, so honor the
// forwarded proto/host instead of trusting request.url.
export function publicOrigin(request: Request): string {
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "localhost:3000";
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    new URL(request.url).protocol.replace(":", "");
  return `${proto}://${host}`;
}

// Absolute dir on disk. In Docker this should be a persisted volume
// (see docker-compose.prod.yml: uploads:/app/public/uploads).
export function uploadRootDir() {
  return process.env.UPLOAD_DIR ?? path.join(process.cwd(), "public", "uploads");
}

function pickExtension(file: File, kind: LocalUploadKind): string | null {
  const fromMime = MIME_TO_EXT[file.type];
  if (fromMime && EXTENSIONS[kind].includes(fromMime)) return fromMime;
  const original = file.name.split(".").pop()?.toLowerCase() ?? "";
  // "jpeg" normalizes to "jpg" for storage consistency
  const normalized = original === "jpeg" ? "jpg" : original;
  if (EXTENSIONS[kind].includes(normalized)) return normalized;
  return null;
}

export async function saveUploadedFile(
  file: File,
  kind: LocalUploadKind,
): Promise<{ url: string; publicId: string }> {
  const ext = pickExtension(file, kind);
  if (!ext) throw new Error("UNSUPPORTED_FILE_TYPE");
  // Random filename: no user input ever reaches the filesystem path.
  const filename = `${randomUUID()}.${ext}`;
  const subdir = kind === "image" ? "images" : "videos";
  const dir = path.join(/*turbopackIgnore: true*/ uploadRootDir(), subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(/*turbopackIgnore: true*/ dir, filename), Buffer.from(await file.arrayBuffer()));
  const urlPath = `/uploads/${subdir}/${filename}`;
  // publicId doubles as the local path reference (replaces the Cloudinary id).
  return { url: urlPath, publicId: urlPath };
}

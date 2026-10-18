const LOCAL_IMAGE_PATH = "/uploads/images/";
const MEDIA_IMAGE_PATH = "/media/images/";
const SITE_HOSTS = new Set(["i8.com.vn", "www.i8.com.vn"]);

export type LocalImageFormat = "webp" | "avif";

/**
 * Return the same-origin filename for an uploaded image, or null when the URL
 * points somewhere else (Cloudinary leftovers, external hosts, videos).
 */
function localImagePath(url: string): string | null {
  if (url.startsWith(LOCAL_IMAGE_PATH)) return url.split("?")[0].slice(LOCAL_IMAGE_PATH.length);
  try {
    const parsed = new URL(url);
    if (SITE_HOSTS.has(parsed.hostname) && parsed.pathname.startsWith(LOCAL_IMAGE_PATH)) {
      return parsed.pathname.slice(LOCAL_IMAGE_PATH.length);
    }
  } catch {
    // relative or malformed URL
  }
  return null;
}

/**
 * Build a resized/optimised URL for images stored on the local uploads disk.
 * The `/media/[...path]` route resizes with sharp and caches the result.
 * External URLs (e.g. Cloudinary leftovers) are returned untouched.
 */
export function sizedImageSrc(
  url: string | null | undefined,
  width: number,
  format: LocalImageFormat = "webp",
): string {
  if (!url) return "";
  const filename = localImagePath(url);
  if (!filename) return url;
  const params = new URLSearchParams({ w: String(width), f: format });
  return `${MEDIA_IMAGE_PATH}${filename}?${params.toString()}`;
}

export function sizedImageSrcSet(
  url: string | null | undefined,
  widths: number[],
  format: LocalImageFormat = "webp",
): string | undefined {
  if (!url || !localImagePath(url)) return undefined;
  return widths.map((width) => `${sizedImageSrc(url, width, format)} ${width}w`).join(", ");
}

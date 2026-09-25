const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export function getYouTubeVideoId(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.split("/").filter(Boolean)[0] ?? null;
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") id = url.searchParams.get("v");
      if (url.pathname.startsWith("/embed/")) id = url.pathname.split("/")[2] ?? null;
    }
    return id && YOUTUBE_ID.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function normalizeYouTubeUrl(value: string) {
  const id = getYouTubeVideoId(value);
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}

export function getYouTubeEmbedUrl(value: string) {
  const id = getYouTubeVideoId(value);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&loop=1&mute=1&controls=0&playlist=${id}` : null;
}

export function isCloudinaryDeliveryUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "res.cloudinary.com" || url.hostname.endsWith(".cloudinary.com"));
  } catch {
    return false;
  }
}

const VIMEO_ID = /^\d{7,12}$/;

export function getVimeoVideoId(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean)[0] ?? null;
      return id && VIMEO_ID.test(id) ? id : null;
    }
    if (host === "player.vimeo.com" && url.pathname.startsWith("/video/")) {
      const id = url.pathname.split("/")[2] ?? null;
      return id && VIMEO_ID.test(id) ? id : null;
    }
    return null;
  } catch {
    return null;
  }
}

export function normalizeVimeoUrl(value: string) {
  const id = getVimeoVideoId(value);
  return id ? `https://vimeo.com/${id}` : null;
}

export function getVimeoEmbedUrl(value: string) {
  const id = getVimeoVideoId(value);
  return id ? `https://player.vimeo.com/video/${id}?api=1&background=1&autoplay=1&loop=1&muted=1&controls=0` : null;
}

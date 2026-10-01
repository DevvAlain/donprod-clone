import type { MetadataRoute } from "next";

const SITE_URL = "https://i8.com.vn";

const STATIC_ROUTES = ["/", "/archive", "/tvc", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route === "/" ? "" : route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.8,
  }));
}

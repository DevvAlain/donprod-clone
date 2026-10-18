import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The CMS and the JSON API are private surfaces: keep them out of the
      // index even though they are also marked noindex in their metadata.
      disallow: ["/admin", "/api"],
    },
    sitemap: "https://i8.com.vn/sitemap.xml",
  };
}

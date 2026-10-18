import type { MetadataRoute } from "next";
import { listProjectSitemapEntries } from "@/services/projects";
import { listTvcSitemapEntries } from "@/services/tvc";

export const dynamic = "force-dynamic";

const SITE_URL = "https://i8.com.vn";

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/tvc", changeFrequency: "weekly", priority: 0.9 },
  { path: "/archive", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, tvcItems] = await Promise.all([
    listProjectSitemapEntries().catch(() => []),
    listTvcSitemapEntries().catch(() => []),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path === "/" ? "" : route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const projectEntries: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_URL}/project/${project.slug}`,
    lastModified: project.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const tvcEntries: MetadataRoute.Sitemap = tvcItems.map((item) => ({
    url: `${SITE_URL}/tvc/${item.slug}`,
    lastModified: item.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...tvcEntries, ...projectEntries];
}

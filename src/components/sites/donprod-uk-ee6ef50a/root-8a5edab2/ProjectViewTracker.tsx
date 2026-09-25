"use client";

import { useEffect } from "react";

export function ProjectViewTracker({ slug }: { slug: string }) {
  useEffect(() => { void fetch(`/api/projects/${encodeURIComponent(slug)}/view`, { method: "POST", keepalive: true }); }, [slug]);
  return null;
}

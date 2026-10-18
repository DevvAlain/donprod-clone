"use client";

import { useEffect, useState } from "react";
import type { DonprodProject } from "@/types/donprod";

interface ApiSuccess<T> { success: true; data: T }

let cached: DonprodProject[] | null = null;
let inflight: Promise<DonprodProject[]> | null = null;

function loadProjects() {
  if (cached) return Promise.resolve(cached);
  if (inflight) return inflight;
  inflight = fetch("/api/projects", { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) throw new Error("Unable to load projects.");
      return response.json() as Promise<ApiSuccess<DonprodProject[]>>;
    })
    .then((payload) => {
      if (!payload.success) throw new Error("Unable to load projects.");
      cached = payload.data;
      return payload.data;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function usePublicProjects(initialProjects?: DonprodProject[]) {
  const seeded = initialProjects && initialProjects.length > 0 ? initialProjects : cached;
  const [projects, setProjects] = useState<DonprodProject[]>(seeded ?? []);
  const [isLoading, setIsLoading] = useState(!seeded);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProjects && initialProjects.length > 0) {
      cached = initialProjects;
      setProjects(initialProjects);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    void loadProjects()
      .then((data) => {
        if (!cancelled) setProjects(data);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : "Unable to load projects.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialProjects]);

  return { projects, isLoading, error };
}

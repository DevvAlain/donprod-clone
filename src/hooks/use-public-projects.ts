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

export function usePublicProjects() {
  const [projects, setProjects] = useState<DonprodProject[]>(cached ?? []);
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  return { projects, isLoading, error };
}

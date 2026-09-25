"use client";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: unknown[];
}

export async function adminRequest<T>(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...init,
    headers: { ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...init?.headers },
  });
  const payload = await response.json().catch(() => ({})) as ApiResponse<T>;
  if (!response.ok || !payload.success) throw new Error(payload.message ?? "Something went wrong.");
  return payload.data as T;
}

"use client";

import { useEffect, useState } from "react";

type Kind = "success" | "error";
type Toast = { id: number; kind: Kind; text: string };

let nextId = 0;
let toasts: Toast[] = [];
const listeners = new Set<(items: Toast[]) => void>();

function emit() {
  listeners.forEach((listener) => listener(toasts));
}

function push(text: string, kind: Kind) {
  const item = { id: ++nextId, kind, text };
  toasts = [...toasts, item];
  emit();
  window.setTimeout(() => {
    toasts = toasts.filter((toast) => toast.id !== item.id);
    emit();
  }, 3200);
}

export function toast(text: string) {
  push(text, "success");
}

export function toastError(text: string) {
  push(text, "error");
}

export function AdminToasts() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    listeners.add(setItems);
    setItems(toasts);
    return () => {
      listeners.delete(setItems);
    };
  }, []);
  if (!items.length) return null;
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[80] grid w-[min(360px,calc(100vw-2rem))] gap-2">
      {items.map((item) => (
        <p
          key={item.id}
          role={item.kind === "error" ? "alert" : "status"}
          className={`rounded-xl px-4 py-3 text-sm shadow-lg ${item.kind === "error" ? "bg-red-600 text-white" : "bg-slate-900 text-white"}`}
        >
          {item.text}
        </p>
      ))}
    </div>
  );
}

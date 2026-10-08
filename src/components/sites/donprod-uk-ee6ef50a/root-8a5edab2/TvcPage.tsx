"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Navbar } from "./Navbar";

type TvcType = "HIGHLIGHTED" | "CSR";
type TabKey = "highlighted" | "csr";

interface TvcItem {
  id: string;
  type: TvcType;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
}

const wrap: React.CSSProperties = {
  minHeight: "100dvh",
  background: "#f6f6f6",
  color: "#111",
  fontFamily: '"IBM Plex Mono", monospace',
};

const monoSmall: React.CSSProperties = { fontSize: 12, letterSpacing: "0.08em" };

export function TvcPage() {
  const [items, setItems] = useState<TvcItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<TabKey>("highlighted");

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/tvc", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { data?: TvcItem[] } | null) => {
        if (!cancelled && payload?.data) setItems(payload.data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    const type: TvcType = active === "highlighted" ? "HIGHLIGHTED" : "CSR";
    return items.filter((item) => item.type === type);
  }, [items, active]);

  return (
    <main style={wrap}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "90px 20px 80px" }}>
        <h1
          style={{
            margin: "0 0 8px",
            textAlign: "center",
            fontFamily: '"Heading Now", sans-serif',
            fontStretch: "condensed",
            fontWeight: 800,
            fontSize: "clamp(40px, 7vw, 96px)",
            lineHeight: 0.9,
            letterSpacing: "-0.01em",
          }}
        >
          COMMERCIAL
        </h1>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 48 }} role="tablist" aria-label="Commercial tabs">
          {(["highlighted", "csr"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={active === tab}
              onClick={() => setActive(tab)}
              style={{
                border: 0,
                background: "none",
                cursor: "pointer",
                font: "inherit",
                ...monoSmall,
                textTransform: "uppercase",
                opacity: active === tab ? 1 : 0.45,
                textDecoration: active === tab ? "underline" : "none",
                textUnderlineOffset: 4,
              }}
            >
              {tab === "highlighted" ? "Highlighted" : "CSR"}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: "center", ...monoSmall }}>Loading…</p>
        ) : visible.length === 0 ? (
          <p style={{ textAlign: "center", ...monoSmall }}>No projects yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
            {visible.map((item) => (
              <article key={item.id}>
                <h2 style={{ margin: "0 0 16px", fontSize: 20, fontWeight: 600, letterSpacing: "0.02em", textAlign: "center" }}>
                  <Link href={`/tvc/${item.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {item.title}
                  </Link>
                </h2>
                {item.imageUrl ? (
                  <Link
                    href={`/tvc/${item.slug}`}
                    aria-label={item.title}
                    // Natural aspect: full image, no top/bottom crop, centered.
                    style={{ display: "block", width: "100%", overflow: "hidden", background: "#e7e7e7" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      style={{ display: "block", width: "100%", height: "auto" }}
                    />
                  </Link>
                ) : null}
                {item.description ? (
                  <p style={{ margin: "16px 0 0", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                    {item.description}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

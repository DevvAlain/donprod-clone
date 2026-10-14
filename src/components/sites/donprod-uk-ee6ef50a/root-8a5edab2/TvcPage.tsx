"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Navbar } from "./Navbar";

type TvcType = "HIGHLIGHTED" | "CSR";
type TabKey = "highlighted" | "csr";

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "highlighted", label: "Photoshoot Campaign" },
  { key: "csr", label: "TV Commercial" },
];

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
  background: "#141414",
  color: "#f6f6f6",
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
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active === tab.key}
              onClick={() => setActive(tab.key)}
              style={{
                border: 0,
                background: "none",
                cursor: "pointer",
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: 17,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                opacity: active === tab.key ? 1 : 0.45,
                textDecoration: active === tab.key ? "underline" : "none",
                textUnderlineOffset: 4,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={{ textAlign: "center", ...monoSmall }}>Loading…</p>
        ) : visible.length === 0 ? (
          <p style={{ textAlign: "center", ...monoSmall }}>No projects yet.</p>
        ) : (
          <>
          <div className="tvc-grid">
            {visible.map((item) => (
              <article key={item.id} className="tvc-card">
                <Link
                  href={`/tvc/${item.slug}`}
                  aria-label={item.title}
                  className="tvc-thumb"
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.title} loading="lazy" />
                  ) : null}
                  <span className="tvc-scrim" aria-hidden="true" />
                  <span className="tvc-title">{item.title}</span>
                </Link>
                <p className="tvc-name">{item.title}</p>
                {item.description ? (
                  <p className="tvc-caption">{item.description}</p>
                ) : null}
              </article>
            ))}
          </div>
          <style>{`
            .tvc-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
            @media (min-width: 640px) { .tvc-grid { grid-template-columns: repeat(2, 1fr); } }
            @media (min-width: 1024px) { .tvc-grid { grid-template-columns: repeat(3, 1fr); } }
            .tvc-card { min-width: 0; }
            .tvc-thumb {
              position: relative;
              display: block;
              width: 100%;
              aspect-ratio: 16 / 10;
              overflow: hidden;
              border-radius: 22px;
              background: #1f1f1f;
              color: #f6f6f6;
              text-decoration: none;
            }
            .tvc-thumb img {
              display: block;
              width: 100%;
              height: 100%;
              object-fit: cover;
              transition: transform .8s cubic-bezier(.16,1,.3,1);
            }
            .tvc-thumb:hover img { transform: scale(1.05); }
            .tvc-scrim {
              position: absolute;
              inset: auto 0 0 0;
              height: 55%;
              background: linear-gradient(to top, rgba(0,0,0,.75), transparent);
              opacity: 0;
              transition: opacity .45s ease;
              pointer-events: none;
            }
            .tvc-title {
              position: absolute;
              right: 18px;
              bottom: 14px;
              left: 18px;
              font-size: 17px;
              font-weight: 600;
              letter-spacing: .02em;
              transform: translateY(130%);
              opacity: 0;
              transition: transform .5s cubic-bezier(.16,1,.3,1), opacity .45s ease;
              pointer-events: none;
            }
            .tvc-thumb:hover .tvc-scrim, .tvc-thumb:focus-visible .tvc-scrim { opacity: 1; }
            .tvc-thumb:hover .tvc-title, .tvc-thumb:focus-visible .tvc-title { transform: translateY(0); opacity: 1; }
            .tvc-caption {
              display: none;
              margin: 12px 4px 0;
              font-size: 13px;
              line-height: 1.6;
              white-space: pre-wrap;
            }
            .tvc-name {
              display: none;
              margin: 12px 4px 0;
              font-size: 15px;
              font-weight: 600;
              letter-spacing: .02em;
            }
            .tvc-name + .tvc-caption { margin-top: 6px; }
            @media (hover: none) { .tvc-caption, .tvc-name { display: block; } }
          `}</style>
          </>
        )}
      </div>
    </main>
  );
}

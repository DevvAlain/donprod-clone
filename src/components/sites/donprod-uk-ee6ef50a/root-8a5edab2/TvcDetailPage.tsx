"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "./Navbar";

interface TvcDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  gallery: Array<{ imageUrl: string; publicId?: string | null }>;
}

export function TvcDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [item, setItem] = useState<TvcDetail | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/tvc/${encodeURIComponent(slug ?? "")}`, { cache: "no-store" })
      .then((response) => {
        if (response.status === 404) {
          if (!cancelled) setMissing(true);
          return null;
        }
        return response.ok ? response.json() : null;
      })
      .then((payload: { data?: TvcDetail } | null) => {
        if (!cancelled && payload?.data) setItem(payload.data);
        else if (!cancelled && payload === null && !missing) setMissing(true);
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#f6f6f6",
        color: "#111",
        fontFamily: '"IBM Plex Mono", monospace',
      }}
    >
      <Navbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "90px 20px 80px" }}>
        <Link
          href="/tvc"
          style={{ display: "inline-block", marginBottom: 24, fontSize: 12, letterSpacing: "0.08em", color: "inherit", textDecoration: "underline", textUnderlineOffset: 4 }}
        >
          ← COMMERCIAL
        </Link>
        {missing ? (
          <p style={{ fontSize: 13 }}>Project not found.</p>
        ) : !item ? (
          <p style={{ fontSize: 12, letterSpacing: "0.08em" }}>Loading…</p>
        ) : (
          <article style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: "0.02em", textAlign: "center" }}>{item.title}</h1>
            {item.imageUrl ? (
              <div style={{ width: "100%", overflow: "hidden", background: "#e7e7e7" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.title} style={{ display: "block", width: "100%", height: "auto", margin: "0 auto" }} />
              </div>
            ) : null}
            {item.description ? (
              <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {item.description.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={index} style={{ margin: "0 0 1em" }}>{paragraph}</p>
                ))}
              </div>
            ) : null}
            {item.gallery.map((entry, index) => (
              <div key={`${entry.imageUrl}-${index}`} style={{ width: "100%", overflow: "hidden", background: "#e7e7e7" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={entry.imageUrl} alt={`${item.title} — ${index + 1}`} loading="lazy" style={{ display: "block", width: "100%", height: "auto", margin: "0 auto" }} />
              </div>
            ))}
          </article>
        )}
      </div>
    </main>
  );
}

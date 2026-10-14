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
          <CollageDetail item={item} />
        )}
      </div>
    </main>
  );
}

function CollageDetail({ item }: { item: TvcDetail }) {
  const frames = [
    ...(item.imageUrl ? [{ imageUrl: item.imageUrl, alt: item.title }] : []),
    ...item.gallery.map((entry, index) => ({
      imageUrl: entry.imageUrl,
      alt: `${item.title} — ${index + 1}`,
    })),
  ];
  // Groups of 3: middle frame is the large center piece.
  const rows: typeof frames[] = [];
  for (let i = 0; i < frames.length; i += 3) rows.push(frames.slice(i, i + 3));

  return (
    <article style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: "0.02em", textAlign: "center" }}>
        {item.title}
      </h1>
      {item.description ? (
        <div style={{ fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap", textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
          {item.description.split(/\n{2,}/).map((paragraph, index) => (
            <p key={index} style={{ margin: "0 0 1em" }}>{paragraph}</p>
          ))}
        </div>
      ) : null}
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="tvc-collage">
          {row.map((frame, frameIndex) => (
            <div
              key={`${frame.imageUrl}-${frameIndex}`}
              className={`tvc-frame${row.length === 1 || (row.length === 3 && frameIndex === 1) ? " tvc-frame-main" : ""}`}
            >
              <div aria-hidden="true" className="tvc-frame-blur" style={{ backgroundImage: `url(${frame.imageUrl})` }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={frame.imageUrl} alt={frame.alt} loading="lazy" />
            </div>
          ))}
        </div>
      ))}
      <style>{`
        .tvc-collage { display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 20px; }
        .tvc-frame {
          position: relative;
          flex: 1 1 0;
          min-width: 0;
          height: 30vh;
          max-height: 300px;
          overflow: hidden;
          background: #fff;
          border: 1px solid #dcdcdc;
          border-radius: 10px;
        }
        .tvc-frame-main { flex: 1.3 1 0; height: 44vh; max-height: 440px; }
        .tvc-frame-blur {
          position: absolute;
          inset: -24px;
          background-size: cover;
          background-position: center;
          filter: blur(24px) brightness(.72);
        }
        .tvc-frame img { position: relative; display: block; width: 100%; height: 100%; object-fit: contain; }
        .tvc-collage:only-of-type { margin-top: 8px; }
        @media (max-width: 640px) {
          .tvc-collage { flex-direction: column; }
          .tvc-frame, .tvc-frame-main { width: 100%; flex: none; height: auto; max-height: 62vh; }
          .tvc-frame img { height: auto; max-height: 62vh; object-fit: contain; }
        }
      `}</style>
    </article>
  );
}

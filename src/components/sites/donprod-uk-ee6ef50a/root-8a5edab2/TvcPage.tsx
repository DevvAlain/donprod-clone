"use client";

import { useEffect, useMemo, useState } from "react";
import { Navbar } from "./Navbar";
import styles from "./TvcPage.module.css";

type TvcType = "HIGHLIGHTED" | "CSR";
type TabKey = "highlighted" | "csr";

interface TvcItem {
  id: string;
  type: TvcType;
  title: string;
  description: string | null;
  imageUrl: string | null;
}

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
    <main className={styles.page}>
      <Navbar />
      <div style={{ paddingTop: 70 }} />
      <div className={styles.about}>
        <div className={styles.header}>
          <div className={styles.kicker}>TỔNG QUAN I8</div>
          <h1 className={styles.title}>DẤU MỐC</h1>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="TVC tabs">
          <button
            type="button"
            role="tab"
            aria-selected={active === "highlighted"}
            onClick={() => setActive("highlighted")}
            className={`${styles.tab} ${active === "highlighted" ? styles.tabActive : ""}`}
          >
            HIGHLIGHTED PROJECT
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={active === "csr"}
            onClick={() => setActive("csr")}
            className={`${styles.tab} ${active === "csr" ? styles.tabActive : ""}`}
          >
            CSR PROJECT
          </button>
        </div>

        <div className={styles.list}>
          {loading ? (
            <div className={styles.status}>Đang tải…</div>
          ) : visible.length === 0 ? (
            <div className={styles.status}>Chưa có dự án TVC.</div>
          ) : (
            visible.map((item) => (
              <section key={item.id} className={styles.item}>
                <div className={styles.lines}>
                  <span className={styles.postTitle}>{item.title}</span>
                </div>
                {item.imageUrl ? (
                  <div className={styles.imageWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.imageUrl} alt={item.title} className={styles.postImg} loading="lazy" />
                  </div>
                ) : null}
                {item.description ? (
                  <div className={styles.desc}>
                    {item.description.split(/\n{2,}/).map((paragraph, index) => (
                      <p key={index} className={styles.descText}>{paragraph}</p>
                    ))}
                  </div>
                ) : null}
              </section>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

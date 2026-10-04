"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { DonprodProject } from "@/types/donprod";
import { ProjectTile } from "./ProjectTile";
import { HeroSection } from "./HeroSection";

interface ScrollListProps {
  projects: DonprodProject[];
  activeIndex: number;
  onActiveChange: (index: number) => void;
  filter: number | null;
  onTileClick?: (project: DonprodProject, element: HTMLElement) => void;
  onFirstTileReady?: (rect: DOMRect) => void;
}

const COPIES = 3; // prev / current / next — the loop wraps by one set width
const MIDDLE_COPY = 1;

export function ScrollList({
  projects,
  activeIndex,
  onActiveChange,
  filter,
  onTileClick,
  onFirstTileReady,
}: ScrollListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const innerContentRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    tileRefs.current = tileRefs.current.slice(0, projects.length);
  }, [projects.length]);

  useEffect(() => {
    if (!onFirstTileReady || !projects.length) return;

    const report = () => {
      const firstTile = tileRefs.current[0];
      if (firstTile) onFirstTileReady(firstTile.getBoundingClientRect());
    };

    const frame = requestAnimationFrame(report);
    window.addEventListener("resize", report);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", report);
    };
  }, [onFirstTileReady, projects.length, isMobile]);

  // IntersectionObserver for mobile active tile detection
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const idx = tileRefs.current.indexOf(entry.target as HTMLDivElement);
          if (idx !== -1) {
            onActiveChange(idx);
          }
        }
      }
    },
    [onActiveChange]
  );

  useEffect(() => {
    if (!isMobile) return; // Lenis handles active detection on desktop

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "-45% 0px -45% 0px",
      threshold: 0,
    });

    const refs = tileRefs.current;
    refs.forEach((el) => { if (el) observer.observe(el); });

    return () => {
      refs.forEach((el) => { if (el) observer.unobserve(el); });
      observer.disconnect();
    };
  }, [handleIntersection, projects.length, isMobile]);

  // Horizontal infinite-loop engine for desktop: vertical wheel drives a
  // smoothed horizontal track; the project set is rendered 3x and the scroll
  // position wraps by one set width so the loop never ends.
  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const lastWheelRef = useRef(0);
  const geomRef = useRef({ tileW: 0, padL: 0, setW: 0, vw: 0 });
  const activeRef = useRef(0);
  // Separate ref array for the desktop loop tiles (mobile keeps tileRefs)
  const loopRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Global index (across all 3 copies) of the tile currently centered in
  // the viewport. Videos play only on the centered tile — whichever copy
  // it belongs to — so autoplay survives full wrap-arounds of the loop.
  const [centeredGlobal, setCenteredGlobal] = useState(0);
  const centeredRef = useRef(0);
  const [edgePad, setEdgePad] = useState(0);

  const measureLoop = useCallback(() => {
    const track = scrollContainerRef.current;
    const count = projects.length;
    if (!track || count === 0) return;
    const probe = loopRefs.current[MIDDLE_COPY * count];
    const tileW = probe?.offsetWidth || track.clientWidth * 0.25;
    const vw = track.clientWidth;
    const padL = Math.max((vw - tileW) / 2, 0);
    geomRef.current = { tileW, padL, setW: count * tileW, vw };
    setEdgePad(padL);
  }, [projects.length]);

  // Initial measure + centering; re-measure when the project set changes
  useEffect(() => {
    if (isMobile || projects.length === 0) return;
    loopRefs.current = loopRefs.current.slice(0, projects.length * COPIES);
    measureLoop();
    const m = geomRef.current;
    // Center the first tile of the middle copy (tile center, not tile edge)
    const startX = m.padL + m.setW + m.tileW / 2 - m.vw / 2;
    targetRef.current = startX;
    currentRef.current = startX;
    activeRef.current = 0;
    onActiveChange(0);
    if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft = startX;
    if (onFirstTileReady) {
      const firstTile = loopRefs.current[MIDDLE_COPY * projects.length];
      if (firstTile) onFirstTileReady(firstTile.getBoundingClientRect());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, projects.length, measureLoop]);

  // Re-measure on viewport resize, keeping the active tile centered
  useEffect(() => {
    if (isMobile) return;
    const onResize = () => {
      measureLoop();
      const g = geomRef.current;
      if (!g.tileW) return;
      const centered = g.padL + g.setW + (activeRef.current + 0.5) * g.tileW - g.vw / 2;
      targetRef.current = centered;
      currentRef.current = centered;
      if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft = centered;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isMobile, measureLoop]);

  // Native wheel listener (passive: false so vertical scroll can drive horizontal)
  useEffect(() => {
    if (isMobile) return;
    const track = scrollContainerRef.current;
    if (!track) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      targetRef.current += event.deltaY + event.deltaX;
      lastWheelRef.current = performance.now();
    };
    track.addEventListener("wheel", onWheel, { passive: false });
    return () => track.removeEventListener("wheel", onWheel);
  }, [isMobile, projects.length]);

  // Smoothing + wrap + snap + coverflow loop
  useEffect(() => {
    if (isMobile || projects.length === 0) return;
    const count = projects.length;
    let rafId: number;
    const tick = () => {
      const track = scrollContainerRef.current;
      const g = geomRef.current;
      if (!track || !g.tileW || !g.setW) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      const now = performance.now();
      let target = targetRef.current;
      let current = currentRef.current;

      // Seamless wrap: keep the viewport inside the middle copy's neighborhood
      const lo = g.padL + g.setW * 0.5;
      const hi = g.padL + g.setW * 2.5;
      if (current < lo || current >= hi || target < lo - g.setW || target >= hi + g.setW) {
        const shift = Math.round((g.padL + g.setW * 1.5 - current) / g.setW) * g.setW;
        if (shift !== 0) {
          current += shift;
          target += shift;
        }
      }

      // Snap to nearest tile center when the wheel goes idle
      if (now - lastWheelRef.current > 160) {
        const rel = current + g.vw / 2 - g.padL;
        const snap = g.padL + (Math.round(rel / g.tileW - 0.5) + 0.5) * g.tileW - g.vw / 2;
        target += (snap - target) * 0.18;
      }

      current += (target - current) * 0.12;
      if (Math.abs(target - current) < 0.1) current = target;
      targetRef.current = target;
      currentRef.current = current;
      track.scrollLeft = current;

      // Active tile = closest to viewport center (wrapped to project index)
      const relC = current + g.vw / 2 - g.padL;
      const idx = ((Math.round(relC / g.tileW - 0.5) % count) + count) % count;
      if (idx !== activeRef.current) {
        activeRef.current = idx;
        onActiveChange(idx);
      }
      // Centered copy-tile drives video playback (any copy, so autoplay
      // keeps working after wrap-arounds)
      const total = count * COPIES;
      const gNorm = ((Math.round(relC / g.tileW - 0.5) % total) + total) % total;
      if (gNorm !== centeredRef.current) {
        centeredRef.current = gNorm;
        setCenteredGlobal(gNorm);
      }

      // Coverflow 3D: rotate/fade tiles by distance from center
      const center = current + g.vw / 2;
      const refs = loopRefs.current;
      for (let n = 0; n < refs.length; n++) {
        const el = refs[n];
        if (!el) continue;
        const tileCenter = g.padL + (n + 0.5) * g.tileW;
        const offset = (tileCenter - center) / g.vw; // -0.5..0.5+
        const abs = Math.min(Math.abs(offset), 0.9);
        const i = n % count;
        const filtered = filter !== null && !projects[i].tags.includes(filter);
        const baseOpacity = filtered ? 0 : 1;
        // Only neighbors visible: anything past ~1.3 frames out is hidden
        // (tiles are ~0.45 viewport widths now).
        const vis = abs >= 0.62 ? 0 : 1 - abs * 0.9;
        el.style.opacity = String(baseOpacity * vis);
        el.style.transform = `perspective(1200px) rotateY(${(offset * -55).toFixed(2)}deg) translateZ(${(-abs * 380).toFixed(1)}px)`;
        el.style.zIndex = abs < 0.15 ? "3" : "2";
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isMobile, projects.length, filter, projects, onActiveChange]);

  const tileList = projects.map((project, i) => {
    const isFiltered = filter !== null && !project.tags.includes(filter);

    const tileProject = {
      slug: project.slug,
      title: project.title,
      artist: project.artist,
      thumbMobile: project.thumbMobile,
      thumbPlaceholder: project.thumbPlaceholder,
      mobileVideo: project.mobileVideo || undefined,
    };

    return (
      <div
        key={project.slug}
        ref={(el) => {
          tileRefs.current[i] = el;
        }}
        style={{
          opacity: isFiltered ? 0 : 1,
          pointerEvents: isFiltered ? "none" : "auto",
          transition: "opacity 0.3s",
          flexShrink: 0,
          width: isMobile ? "100%" : "clamp(200px, 25.14vw, 362px)",
        }}
      >
        <ProjectTile
          project={tileProject}
          isActive={i === activeIndex}
          isMobile={isMobile}
          index={i + 1}
          onActivate={() => onActiveChange(i)}
          onTileClick={onTileClick ? (element) => onTileClick(projects[i], element) : undefined}
          isHoveredSelf={hoveredIndex === i}
          isHoveredByOther={hoveredIndex !== null && hoveredIndex !== i}
          onTileMouseEnter={() => {
            if (i !== activeIndex) setHoveredIndex(i);
          }}
          onTileMouseLeave={() => setHoveredIndex(null)}
        />
      </div>
    );
  });

  // Desktop loop tiles: the project set rendered 3x (prev/current/next).
  // Only the middle copy drives the active state; side copies stay dimmed.
  const tileLoop = Array.from({ length: COPIES }).flatMap((_, copy) =>
    projects.map((project, i) => {
      const isFiltered = filter !== null && !project.tags.includes(filter);
      const globalIndex = copy * projects.length + i;

      const tileProject = {
        slug: project.slug,
        title: project.title,
        artist: project.artist,
        thumbMobile: project.thumbMobile,
        thumbPlaceholder: project.thumbPlaceholder,
        mobileVideo: project.mobileVideo || undefined,
      };

      return (
        <div
          key={`${copy}-${project.slug}`}
          ref={(el) => {
            loopRefs.current[globalIndex] = el;
          }}
          style={{
            opacity: isFiltered ? 0 : 1,
            pointerEvents: isFiltered ? "none" : "auto",
            flexShrink: 0,
            // Large showcase frames (~2 per viewport + peek neighbors)
            width: "clamp(420px, 45vw, 720px)",
          }}
        >
          <ProjectTile
            project={tileProject}
            isActive={globalIndex === centeredGlobal}
            isMobile={false}
            index={i + 1}
            onActivate={() => onActiveChange(i)}
            onTileClick={onTileClick ? (element) => onTileClick(projects[i], element) : undefined}
            isHoveredSelf={hoveredIndex === i}
            isHoveredByOther={hoveredIndex !== null && hoveredIndex !== i}
            onTileMouseEnter={() => {
              if (i !== activeIndex) setHoveredIndex(i);
            }}
            onTileMouseLeave={() => setHoveredIndex(null)}
          />
        </div>
      );
    }),
  );

  if (isMobile) {
    const scrollTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    return (
      <div className="homepage_wrapper" style={{ width: "100%", minHeight: "100dvh", background: "#000" }}>
        <div className="m_items__wrapper" style={{ padding: "60px 20px 0", width: "100%" }}>
          <div
            className="mob_hero__wrapper"
            style={{
              position: "relative",
              width: "100%",
              margin: "30px 0",
              paddingBottom: 10,
              textAlign: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="home-upper-logo"
              src="/sites/donprod-uk-ee6ef50a/root-8a5edab2/images/logo-upper.png"
              alt="I8 STUDIO"
              style={{ display: "block", width: "90%", maxWidth: "90%", height: "auto", margin: "0 auto" }}
            />
          </div>
          <div className="vertical_project_wrapper" style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            {tileList}
          </div>
          <div
            className="m_home_footer"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 120,
              marginBottom: 120,
              fontFamily: '"Heading Now", sans-serif',
            }}
          >
            <button
              type="button"
              onClick={scrollTop}
              style={{
                border: 0,
                background: "transparent",
                color: "#f6f6f6",
                fontFamily: '"Heading Now", sans-serif',
                fontSize: "14vw",
                fontStretch: "condensed",
                fontWeight: 800,
                lineHeight: 0.8,
                padding: "5px 5px 2px",
                cursor: "pointer",
              }}
            >
              BACK TO THE TOP
            </button>
            <div
              className="m-footer-socials"
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
                width: "100%",
                marginTop: 25,
                fontSize: "4vw",
                fontFamily: '"IBM Plex Mono", monospace',
              }}
            >
              <a href="https://www.instagram.com/donprod/?hl=en" target="_blank" rel="noreferrer" style={{ color: "#f6f6f6", textDecoration: "none" }}>INSTA</a>
              <a href="https://www.tiktok.com/@donprod?lang=en" target="_blank" rel="noreferrer" style={{ color: "#f6f6f6", textDecoration: "none" }}>TIKTOK</a>
              <a href="https://vimeo.com/donprod" target="_blank" rel="noreferrer" style={{ color: "#f6f6f6", textDecoration: "none" }}>VIMEO</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="home_content_wrapper"
      style={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div
        id="main-container"
        ref={scrollContainerRef}
        className="scroll_wrapper"
        style={{
          width: "100%",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/*
         * horizontal_project_wrapper — full height; the hero stays absolute
         * at the top while tiles run in a centered horizontal row.
         */}
        <div
          ref={innerContentRef}
          className="horizontal_project_wrapper"
          style={{
            position: "relative",
            height: "100%",
            width: "fit-content",
          }}
        >
          {/*
           * home_hero__wrapper — FIXED to the viewport so it never drifts
           * with the horizontal loop; only the project tiles move.
           * Same size/position as before, just viewport-anchored.
           */}
          <div
            className="home_hero__wrapper"
            style={{
              position: "fixed",
              top: 60,
              left: "50%",
              transform: "translateX(-50%)",
              width: "100vw",
              height: "calc(40vh - 70px)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            <HeroSection />
          </div>

          {/* Centered tile row — edge spacers let the first/last tile reach center */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              height: "100%",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div style={{ width: edgePad, flexShrink: 0 }} />

            {tileLoop}

            <div style={{ width: edgePad, flexShrink: 0 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

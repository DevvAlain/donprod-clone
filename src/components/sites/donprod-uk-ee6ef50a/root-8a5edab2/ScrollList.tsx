"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Lenis from "lenis";
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

const SPACER_COUNT = 2;

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

  // Lenis scroll system for desktop
  useEffect(() => {
    if (isMobile) return;
    if (!scrollContainerRef.current || !innerContentRef.current) return;

    const lenis = new Lenis({
      wrapper: scrollContainerRef.current,
      content: innerContentRef.current,
      lerp: 0.2,
      wheelMultiplier: 0.5,
      touchMultiplier: 2,
      syncTouch: false,
    });

    let snapTimeout: ReturnType<typeof setTimeout>;

    lenis.on("scroll", ({ scroll }: { scroll: number; velocity: number }) => {
      const tileH = window.innerHeight * 0.2; // 20dvh
      const idx = Math.round(scroll / tileH);
      const clamped = Math.max(0, Math.min(projects.length - 1, idx));
      onActiveChange(clamped);

      clearTimeout(snapTimeout);
      snapTimeout = setTimeout(() => {
        lenis.scrollTo(clamped * tileH, {
          duration: 0.5,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
        });
      }, 150);
    });

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      clearTimeout(snapTimeout);
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [isMobile, projects.length, onActiveChange]);

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
              alt="DON"
              style={{ display: "block", width: "90%", maxWidth: "90%", height: "auto", margin: "0 auto" }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="home-lower-logo"
              src="/sites/donprod-uk-ee6ef50a/root-8a5edab2/images/logo-lower.png"
              alt="PROD"
              style={{ display: "block", width: "42%", height: "auto", margin: "8px auto 0" }}
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
         * vertical_project_wrapper — full width so the hero inside can be 100vw.
         * The hero is position:absolute within this, scrolling away as you scroll.
         * Tiles are in a centered column inside.
         */}
        <div
          ref={innerContentRef}
          className="vertical_project_wrapper"
          style={{
            position: "relative",
            width: "100%",
            height: "fit-content",
          }}
        >
          {/*
           * home_hero__wrapper — matches original inline style exactly:
           * position:absolute; top:60px; width:100vw; height:calc(-70px + 40vh);
           * left:50%; transform:translateX(-50%); pointer-events:none; z-index:1
           * Scrolls away with content as user scrolls down.
           */}
          <div
            className="home_hero__wrapper"
            style={{
              position: "absolute",
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

          {/* Centered tile column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              position: "relative",
              zIndex: 2,
            }}
          >
            {/* Top spacers — 2×20dvh = 40dvh, placing first tile at center of 5-tile viewport */}
            {Array.from({ length: SPACER_COUNT }).map((_, i) => (
              <div
                key={`spacer-top-${i}`}
                style={{ height: "20dvh", width: "clamp(200px, 25.14vw, 362px)", flexShrink: 0 }}
              />
            ))}

            {tileList}

            {/* Bottom spacers — so last tile can reach center */}
            {Array.from({ length: SPACER_COUNT }).map((_, i) => (
              <div
                key={`spacer-bottom-${i}`}
                style={{ height: "20dvh", width: "clamp(200px, 25.14vw, 362px)", flexShrink: 0 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

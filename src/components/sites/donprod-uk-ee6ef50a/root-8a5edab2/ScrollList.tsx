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
  onTileClick?: (project: DonprodProject) => void;
}

const BASE_URL = "https://www.donprod.uk/media/main";

function getThumbPlaceholder(slug: string): string {
  return `${BASE_URL}/${slug}/thumbnails/placeholder.webp`;
}

function getMobileVideo(slug: string): string {
  return `${BASE_URL}/${slug}/trim_mobile.mp4`;
}

const SPACER_COUNT = 2;

export function ScrollList({
  projects,
  activeIndex,
  onActiveChange,
  filter,
  onTileClick,
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
      thumbMobile: project.thumbMobile.startsWith("http")
        ? project.thumbMobile
        : `${BASE_URL}/${project.slug}/thumbnails/mobile.webp`,
      thumbPlaceholder: project.thumbPlaceholder ?? getThumbPlaceholder(project.slug),
      mobileVideo: project.mobileVideo ?? getMobileVideo(project.slug),
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
          onTileClick={onTileClick ? () => onTileClick(projects[i]) : undefined}
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
    return (
      <div
        className="home_content_wrapper"
        style={{ width: "100%", height: "auto" }}
      >
        <div
          className="vertical_project_wrapper"
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          {tileList}
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

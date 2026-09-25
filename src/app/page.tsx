"use client";

import { useState, useEffect, useRef } from "react";
import type { DonprodProject } from "@/types/donprod";
import { usePublicProjects } from "@/hooks/use-public-projects";
import { Navbar } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/Navbar";
import { ScrollList } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/ScrollList";
import { HomeAuxOverlay } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/HomeAuxOverlay";
import { useRouteTransition } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/RouteTransition";
import { FloatingVideo } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/FloatingVideo";
import { CustomCursor } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/CustomCursor";
import { NoiseOverlay } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/NoiseOverlay";
import { IntroAnimation } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/IntroAnimation";
import { HomeArchiveView } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/HomeArchiveView";

const INTRO_STORAGE_PREFIX = "intro-seen-";

function getIntroStorageKey() {
  return `${INTRO_STORAGE_PREFIX}${window.performance.timeOrigin}`;
}

function EmptyProjectsState({ isMobile }: { isMobile: boolean }) {
  return (
    <div
      style={{
        position: isMobile ? "relative" : "absolute",
        inset: isMobile ? undefined : 0,
        width: "100%",
        minHeight: isMobile ? "100dvh" : undefined,
        height: isMobile ? "100dvh" : "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          color: "#868686",
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: "10.8px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        No projects yet
      </span>
    </div>
  );
}

export default function DonprodHomePage() {
  const { openProject } = useRouteTransition();
  const { projects, isLoading, error } = usePublicProjects();
  const [activeIndex, setActiveIndex] = useState(0);
  const [filter, setFilter] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [loaderFinished, setLoaderFinished] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "archive">("list");
  const [renderMode, setRenderMode] = useState<"list" | "archive">("list");
  const [archiveExiting, setArchiveExiting] = useState(false);
  const [modeLocked, setModeLocked] = useState(false);
  const modeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [overlayTarget, setOverlayTarget] = useState<DOMRect | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  const handleViewModeChange = (mode: "list" | "archive") => {
    if (modeLocked || mode === viewMode) return;

    if (modeTimerRef.current) {
      clearTimeout(modeTimerRef.current);
      modeTimerRef.current = null;
    }

    setModeLocked(true);
    setViewMode(mode);

    if (mode === "archive") {
      setRenderMode("archive");
      modeTimerRef.current = setTimeout(() => setModeLocked(false), 2000);
      return;
    }

    setArchiveExiting(true);
    modeTimerRef.current = setTimeout(() => {
      setRenderMode("list");
      setArchiveExiting(false);
      setModeLocked(false);
      modeTimerRef.current = null;
    }, 1250);
  };

  useEffect(() => {
    return () => {
      if (modeTimerRef.current) clearTimeout(modeTimerRef.current);
    };
  }, []);

  const handleTileClick = (project: DonprodProject, element?: HTMLElement) => {
    const thumbSrc = project.thumbDesktop || project.thumbMobile || project.thumbnails?.desktop || "";
    const rect = element?.getBoundingClientRect();
    openProject({
      href: `/project/${project.slug.toLowerCase()}`,
      thumbSrc,
      placeholderSrc: project.thumbPlaceholder || thumbSrc,
      fromRect: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : undefined,
    });
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const activeProject = projects[activeIndex] ?? projects[0];
  const firstProject = projects[0];
  const introMedia = firstProject?.gifStyling.backgroundImage || firstProject?.thumbDesktop;

  useEffect(() => {
    if (sessionStorage.getItem(getIntroStorageKey())) {
      setIntroComplete(true);
    }
  }, []);

  useEffect(() => {
    if (introComplete || !loaderFinished || isMobile) return;
    if (!firstProject && !isLoading) {
      setIntroComplete(true);
      sessionStorage.setItem(getIntroStorageKey(), "1");
      return;
    }
    if (firstProject && overlayTarget) setShowOverlay(true);
  }, [firstProject, introComplete, isLoading, isMobile, loaderFinished, overlayTarget]);

  if (isMobile) {
    return (
      <>
        {!introComplete && (
          <IntroAnimation
            onComplete={() => {
              sessionStorage.setItem(getIntroStorageKey(), "1");
              setIntroComplete(true);
            }}
          />
        )}
        <div
          style={{ opacity: introComplete ? 1 : 0, transition: "opacity 0.3s" }}
        >
          <div
            className="donprod-page"
            style={{ position: "relative", width: "100%", background: "#000" }}
          >
            {/* Fixed nav */}
            <Navbar />

            {isLoading ? (
              <main className="min-h-screen bg-black" aria-busy="true" />
            ) : error ? (
              <main className="min-h-screen bg-black" />
            ) : activeProject ? (
              <div style={{ position: "relative", width: "100%", zIndex: 2 }}>
                <ScrollList
                  projects={projects}
                  activeIndex={activeIndex}
                  onActiveChange={setActiveIndex}
                  filter={filter}
                  onTileClick={handleTileClick}
                />
              </div>
            ) : (
              <EmptyProjectsState isMobile />
            )}

            <NoiseOverlay />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {!introComplete && (
        <IntroAnimation
          onComplete={() => {
            setLoaderFinished(true);
          }}
        />
      )}
      {showOverlay && overlayTarget && introMedia && (
        <FloatingVideo
          desktopThumb={introMedia}
          desktopVideo={firstProject?.mobileVideo || undefined}
          isVisible={true}
          overlayMode={true}
          targetRect={overlayTarget}
          onOverlayComplete={() => {
            sessionStorage.setItem(getIntroStorageKey(), "1");
            setIntroComplete(true);
            setShowOverlay(false);
          }}
        />
      )}
      <div
        style={{ opacity: introComplete ? 1 : 0, transition: "opacity 0.3s" }}
      >
        <div
          className="donprod-page"
          style={{
            position: "relative",
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          {/* Fixed nav — z:101 */}
          <Navbar />

          {isLoading ? (
            <main className="min-h-screen bg-black" aria-busy="true" />
          ) : error ? (
            <main className="min-h-screen bg-black" />
          ) : activeProject ? (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
            }}
          >
            {/* Floating project background — z:1 (behind tiles) */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 1,
              }}
            >
              {renderMode === "list" && (
                <FloatingVideo
                  desktopThumb={activeProject.thumbDesktop}
                  desktopVideo={activeProject.mobileVideo || undefined}
                  isVisible={true}
                />
              )}
            </div>

            {/* Scroll-driven project list or archive view — z:2 */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 2,
              }}
            >
              {renderMode === "archive" ? (
                <HomeArchiveView
                  projects={projects}
                  onTileClick={handleTileClick}
                  isExiting={archiveExiting}
                />
              ) : (
                <ScrollList
                  projects={projects}
                  activeIndex={activeIndex}
                  onActiveChange={setActiveIndex}
                  filter={filter}
                  onTileClick={handleTileClick}
                  onFirstTileReady={setOverlayTarget}
                />
              )}
            </div>

            {/* Info overlay — z:10, pointer-events auto for filter clicks */}
            <div style={{ position: "absolute", top: 0, left: 0, zIndex: 10 }}>
              <HomeAuxOverlay
                projects={projects}
                activeIndex={activeIndex}
                activeFilter={filter}
                onFilterChange={setFilter}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
              />
            </div>
          </div>
          ) : (
            <EmptyProjectsState isMobile={false} />
          )}

          {/* Fixed noise grain — z:100 */}
          <NoiseOverlay />

          {/* Custom cursor — z:100000 */}
          <CustomCursor />
        </div>
      </div>
    </>
  );
}

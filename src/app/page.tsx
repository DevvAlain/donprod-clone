"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DONPROD_PROJECTS } from "@/types/donprod";
import { Navbar } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/Navbar";
import { ScrollList } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/ScrollList";
import { ProjectTransition } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/ProjectTransition";
import { HomeAuxOverlay } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/HomeAuxOverlay";
import { FloatingVideo } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/FloatingVideo";
import { CustomCursor } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/CustomCursor";
import { NoiseOverlay } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/NoiseOverlay";
import { IntroAnimation } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/IntroAnimation";
import { HomeArchiveView } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/HomeArchiveView";

interface TransitionState {
  slug: string;
  thumbSrc: string;
  placeholderSrc: string;
}

export default function DonprodHomePage() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [filter, setFilter] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "archive">("list");
  const [transition, setTransition] = useState<TransitionState | null>(null);

  const handleTileClick = (project: typeof DONPROD_PROJECTS[0]) => {
    if (isMobile) {
      router.push(`/project/${project.slug.toLowerCase()}`);
      return;
    }
    setTransition({
      slug: project.slug.toLowerCase(),
      thumbSrc: project.thumbDesktop ?? `https://www.donprod.uk/media/main/${project.slug}/thumbnails/desktop.webp`,
      placeholderSrc: project.thumbPlaceholder ?? `https://www.donprod.uk/media/main/${project.slug}/thumbnails/placeholder.webp`,
    });
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("intro-seen")) {
      setIntroComplete(true);
    }
  }, []);

  const activeProject = DONPROD_PROJECTS[activeIndex] ?? DONPROD_PROJECTS[0];

  if (isMobile) {
    return (
      <>
        {!introComplete && (
          <IntroAnimation
            onComplete={() => {
              sessionStorage.setItem("intro-seen", "1");
              setIntroComplete(true);
            }}
          />
        )}
        <div
          style={{ opacity: introComplete ? 1 : 0, transition: "opacity 0.3s" }}
        >
          <div
            className="donprod-page"
            style={{ position: "relative", width: "100vw", background: "#000" }}
          >
            {/* Fixed nav */}
            <Navbar />

            {/* Project tiles — full-width natural scroll */}
            <div style={{ position: "relative", width: "100%", zIndex: 2 }}>
              <ScrollList
                projects={DONPROD_PROJECTS}
                activeIndex={activeIndex}
                onActiveChange={setActiveIndex}
                filter={filter}
              />
            </div>

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
            sessionStorage.setItem("intro-seen", "1");
            setIntroComplete(true);
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

          {/* Main stage — full viewport width */}
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
              <FloatingVideo
                desktopThumb={activeProject.thumbDesktop}
                desktopVideo={`https://www.donprod.uk/media/main/${activeProject.slug}/trim.mp4`}
                isVisible={true}
              />
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
              {viewMode === "archive" ? (
                <HomeArchiveView projects={DONPROD_PROJECTS} />
              ) : (
                <ScrollList
                  projects={DONPROD_PROJECTS}
                  activeIndex={activeIndex}
                  onActiveChange={setActiveIndex}
                  filter={filter}
                  onTileClick={handleTileClick}
                />
              )}
            </div>

            {/* Info overlay — z:10, pointer-events auto for filter clicks */}
            <div style={{ position: "absolute", top: 0, left: 0, zIndex: 10 }}>
              <HomeAuxOverlay
                projects={DONPROD_PROJECTS}
                activeIndex={activeIndex}
                activeFilter={filter}
                onFilterChange={setFilter}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>

          {/* Fixed noise grain — z:100 */}
          <NoiseOverlay />

          {/* Page transition overlay — z:100+ */}
          {transition && (
            <ProjectTransition
              thumbSrc={transition.thumbSrc}
              placeholderSrc={transition.placeholderSrc}
              onAnimationEnd={() => {
                router.push(`/project/${transition.slug}`);
                setTransition(null);
              }}
            />
          )}

          {/* Custom cursor — z:100000 */}
          <CustomCursor />
        </div>
      </div>
    </>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DONPROD_PROJECTS } from "@/types/donprod";
import { Navbar } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/Navbar";
import { ArchiveListItem } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/ArchiveListItem";
import { MobArchiveListItem } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/MobArchiveListItem";
import { ArchiveBackground } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/ArchiveBackground";
import { ProjectTransition } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/ProjectTransition";

// Filters: 0 = all, 1 = music, 2 = commercial
const FILTERS = [
  { id: 0, label: "all" },
  { id: 1, label: "music" },
  { id: 2, label: "commercial" },
];

function getFilterCount(filterId: number) {
  if (filterId === 0) return DONPROD_PROJECTS.length;
  return DONPROD_PROJECTS.filter((p) => p.tags.includes(filterId)).length;
}

// Animation for the list wrapper on filter change
const listWrapperVariants = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: { duration: 0.75 },
  },
};

export default function ArchivePage() {
  const router = useRouter();
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeFilter, setActiveFilter] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [transition, setTransition] = useState<{ slug: string; thumbSrc: string; placeholderSrc: string } | null>(null);
  const [isHoveringList, setIsHoveringList] = useState(false);
  const [mobOverlayMode, setMobOverlayMode] = useState(false);
  const archiveElementRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileElementRefs = useRef<(HTMLDivElement | null)[]>([]);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 600);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Reset activeIdx to first visible item when filter changes
  useEffect(() => {
    if (activeFilter === 0) {
      setActiveIdx(0);
    } else {
      const firstIdx = DONPROD_PROJECTS.findIndex((p) =>
        p.tags.includes(activeFilter)
      );
      setActiveIdx(firstIdx >= 0 ? firstIdx : 0);
    }
  }, [activeFilter]);

  const handleProjectRedirect = (selected: number) => {
    const project = DONPROD_PROJECTS[selected];
    if (isMobile) {
      router.push(`/project/${project.slug}`);
      return;
    }
    setTransition({
      slug: project.slug.toLowerCase(),
      thumbSrc: project.thumbDesktop ?? `https://www.donprod.uk/media/main/${project.slug}/thumbnails/desktop.webp`,
      placeholderSrc: project.thumbPlaceholder ?? `https://www.donprod.uk/media/main/${project.slug}/thumbnails/placeholder.webp`,
    });
  };

  const handleMouseEnter = useCallback(
    (idx: number) => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = setTimeout(
        () => {
          setActiveIdx(idx);
          setIsHoveringList(true);
        },
        idx === activeIdx ? 50 : 300
      );
    },
    [activeIdx]
  );

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setIsHoveringList(false);
  }, []);

  const handleMobLiClick = (idx: number) => {
    if (!mobOverlayMode) {
      setActiveIdx(idx);
      setMobOverlayMode(true);
    } else if (idx !== activeIdx) {
      setActiveIdx(idx);
    }
  };

  const activeProject = DONPROD_PROJECTS[activeIdx] ?? null;

  return (
    <>
      {!isMobile ? (
        /* ===== DESKTOP LAYOUT ===== */
        <>
          {/*
           * .archive_background_element_wrapper
           * Rendered BEFORE the page wrapper in DOM so it naturally sits behind it.
           * The page wrapper has no background, letting the thumbnail show through.
           * z-index: 0 (visible above the black body background).
           */}
          <ArchiveBackground
            project={activeProject}
            activeIdx={activeIdx}
            isVisible={isHoveringList}
          />

          {/*
           * .archive_page_wrapper
           * height: 100vh; position: fixed; width: 100%;
           * No background — body background (#000 from globals) shows through.
           */}
          <div
            style={{
              height: "100vh",
              position: "fixed",
              width: "100%",
              top: 0,
              left: 0,
            }}
          >
            <Navbar />

            {/*
             * .archive_content_wrapper
             * align-items: center; display: flex; flex-direction: column;
             * height: 100%; justify-content: center; width: 100%;
             */}
            <div
              style={{
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "center",
                width: "100%",
              }}
            >
              {/*
               * .archive_list_wrapper
               * align-items: center; display: flex; flex-direction: column;
               * font-weight: 500; justify-content: flex-start;
               * left: 0; overflow: scroll; padding: 60px 0;
               * pointer-events: none; ← CRITICAL (each archv_it overrides with pointer-events: all)
               * position: relative; text-transform: uppercase; top: 0; width: 100vw;
               */}
              <div
                style={{
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "column",
                  fontWeight: 500,
                  justifyContent: "flex-start",
                  left: 0,
                  overflow: "scroll",
                  padding: "60px 0",
                  pointerEvents: "none",
                  position: "relative",
                  textTransform: "uppercase",
                  top: 0,
                  width: "100vw",
                  height: "100%",
                  // Hide scrollbar visually, keep scrollability
                  scrollbarWidth: "none",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`list-${activeFilter}`}
                    variants={listWrapperVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    style={{ width: "100%" }}
                  >
                    {DONPROD_PROJECTS.map((item, idx) => (
                      <ArchiveListItem
                        key={item.slug}
                        item={item}
                        idx={idx}
                        activeIdx={activeIdx}
                        activeFilter={activeFilter}
                        isFiltered={
                          activeFilter !== 0 && !item.tags.includes(activeFilter)
                        }
                        archiveElementRefs={archiveElementRefs}
                        onMouseEnter={() => handleMouseEnter(idx)}
                        onMouseLeave={handleMouseLeave}
                        handleEleClicked={handleProjectRedirect}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/*
           * .aux-p-ct > .bottom_filter_wrapper
           * Rendered as sibling AFTER the archive_page_wrapper.
           *
           * .bottom_filter_wrapper:
           * position: fixed; bottom: 0; right: 0;
           * margin-bottom: 20px; padding-right: 20px;
           * display: flex; flex-direction: row; justify-content: flex-end;
           * text-transform: lowercase; font-size: 13px; z-index: 2;
           */}
          <div>
            <div
              style={{
                position: "fixed",
                bottom: 0,
                right: 0,
                marginBottom: "20px",
                paddingRight: "20px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                textTransform: "lowercase",
                fontSize: "13px",
                zIndex: 2,
                fontFamily: '"IBM Plex Mono", monospace',
              }}
            >
              {FILTERS.map((f, i) => {
                const count = getFilterCount(f.id);
                const isActive = activeFilter === f.id;
                return (
                  /*
                   * .bottom_fi_wrap (+ .b_act_filter when active)
                   * align-items: center; display: flex; flex-direction: row;
                   * justify-content: flex-start; position: relative;
                   * transition: color .35s ease;
                   * color: var(--unselected-color, #868686) default
                   * .b_act_filter { color: #f6f6f6 !important }
                   * .bottom_fi_wrap:not(:last-child) { padding-right: 50px; }
                   */
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    style={{
                      alignItems: "center",
                      color: isActive ? "#f6f6f6" : "#868686",
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "flex-start",
                      position: "relative",
                      transition: "color .35s ease",
                      paddingRight: i < FILTERS.length - 1 ? "50px" : "0",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: '"IBM Plex Mono", monospace",',
                      fontSize: "13px",
                      textTransform: "lowercase",
                      padding: i < FILTERS.length - 1 ? "0 50px 0 0" : "0",
                    }}
                  >
                    {/* .b_filter-bullet (decorative empty span) */}
                    <span />
                    {/* .b_filter_item */}
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                      {/* .b_filter_name { padding-right: 20px; } */}
                      <span style={{ paddingRight: "20px" }}>{f.label}</span>
                      {/* .b_filter_count_wrap { align-items: flex-end; display: flex; flex-direction: row; } */}
                      <div
                        style={{
                          alignItems: "flex-end",
                          display: "flex",
                          flexDirection: "row",
                        }}
                      >
                        <span>[</span>
                        <span>{count}</span>
                        <span>]</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Page transition overlay — same animation as homepage tile click */}
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
        </>
      ) : (
        /* ===== MOBILE LAYOUT ===== */
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#000",
            overflow: "hidden",
          }}
        >
          <Navbar />
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflowY: "auto",
              overflowX: "hidden",
              paddingTop: "50px",
              paddingBottom: "80px",
              scrollbarWidth: "none",
            }}
          >
            {/* Mobile header */}
            <div
              style={{
                padding: "0 20px 12px",
                display: "flex",
                alignItems: "center",
                gap: "0.5em",
                fontFamily: '"IBM Plex Mono", monospace',
                color: "#f6f6f6",
                fontSize: "10px",
                letterSpacing: "0.1em",
                overflow: "hidden",
              }}
            >
              <motion.span
                initial={{ y: "100%", opacity: 0 }}
                animate={{
                  y: "0%",
                  opacity: 1,
                  transition: { delay: 0.3, duration: 1.25, ease: [0.16, 1, 0.3, 1] },
                }}
                style={{ display: "block", fontSize: "clamp(11px, 3.5vw, 14px)" }}
              >
                PROJECTS
              </motion.span>
              <div style={{ overflow: "hidden" }}>
                <motion.span
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{
                    y: "0%",
                    opacity: 1,
                    transition: { delay: 0.55, duration: 1.25, ease: [0.16, 1, 0.3, 1] },
                  }}
                  style={{
                    display: "block",
                    fontSize: "clamp(11px, 3.5vw, 14px)",
                    opacity: 0.55,
                  }}
                >
                  [{DONPROD_PROJECTS.length}]
                </motion.span>
              </div>
            </div>

            {/* Mobile filter row */}
            <div
              style={{
                padding: "0 20px 16px",
                display: "flex",
                gap: "1.5em",
                fontFamily: '"IBM Plex Mono", monospace',
                color: "#f6f6f6",
                fontSize: "10px",
                letterSpacing: "0.1em",
              }}
            >
              {FILTERS.map((f) => {
                const isActive = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#f6f6f6",
                      fontFamily: '"IBM Plex Mono", monospace',
                      fontSize: "10px",
                      letterSpacing: "0.1em",
                      padding: "4px 0",
                      opacity: isActive ? 1 : 0.4,
                      transition: "opacity 0.3s ease",
                      borderBottom: isActive
                        ? "1px solid #f6f6f6"
                        : "1px solid transparent",
                      textTransform: "uppercase",
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Mobile list */}
            {DONPROD_PROJECTS.map((item, idx) => (
              <MobArchiveListItem
                key={item.slug}
                item={item}
                idx={idx}
                activeIdx={activeIdx}
                isInFilter={activeFilter === 0 || item.tags.includes(activeFilter)}
                handleMobLiClick={handleMobLiClick}
                mobileElementRefs={mobileElementRefs}
              />
            ))}

            {/* Mobile thumbnail overlay when item selected */}
            <AnimatePresence>
              {mobOverlayMode && activeProject && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.4 } }}
                  exit={{ opacity: 0, transition: { duration: 0.35 } }}
                  onClick={() => setMobOverlayMode(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 150,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0,0,0,0.85)",
                    padding: "20px",
                  }}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                    }}
                    exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.3 } }}
                    style={{
                      width: "calc(100vw - 40px)",
                      maxWidth: "460px",
                      border: "1px solid rgba(246,246,246,0.25)",
                      overflow: "hidden",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={activeProject.thumbnails.mobile}
                      alt={activeProject.title}
                      style={{
                        width: "100%",
                        display: "block",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      style={{
                        padding: "16px 20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontFamily: '"IBM Plex Mono", monospace',
                        color: "#f6f6f6",
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                      }}
                    >
                      <button
                        onClick={() => handleProjectRedirect(activeIdx)}
                        style={{
                          background: "none",
                          border: "1px solid rgba(246,246,246,0.4)",
                          cursor: "pointer",
                          color: "#f6f6f6",
                          fontFamily: '"IBM Plex Mono", monospace',
                          fontSize: "11px",
                          letterSpacing: "0.1em",
                          padding: "8px 16px",
                        }}
                      >
                        VIEW PROJECT
                      </button>
                      <button
                        onClick={() => setMobOverlayMode(false)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#f6f6f6",
                          fontFamily: '"IBM Plex Mono", monospace',
                          fontSize: "11px",
                          letterSpacing: "0.1em",
                          opacity: 0.55,
                          padding: "8px 0",
                        }}
                      >
                        CLOSE
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile back to top */}
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                fontFamily: '"IBM Plex Mono", monospace',
                color: "#f6f6f6",
                fontSize: "10px",
                letterSpacing: "0.15em",
                opacity: 0.4,
                cursor: "pointer",
              }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              TO THE TOP
            </div>
          </div>
        </div>
      )}
    </>
  );
}

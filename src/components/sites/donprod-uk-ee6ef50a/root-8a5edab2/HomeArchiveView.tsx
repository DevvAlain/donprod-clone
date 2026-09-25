"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { DonprodProject } from "@/types/donprod";

interface HomeArchiveViewProps {
  projects: DonprodProject[];
  onTileClick?: (project: DonprodProject, element: HTMLElement) => void;
  isExiting?: boolean;
}

function getColumnCount(count: number) {
  if (count <= 1) return 1;
  if (count <= 3) return 2;
  if (count <= 8) return 3;
  if (count <= 15) return 4;
  if (count <= 24) return 5;
  return 6;
}

const MARGIN_X = 8;
const MARGIN_Y = 14;

function isVideoUrl(url: string | null | undefined) {
  return Boolean(url && /\.(mp4|webm|mov|m4v)(?:\?|$)/i.test(url));
}

function previewVideo(project: DonprodProject) {
  const candidates = [
    project.gifStyling?.mobileVideo,
    project.gifStyling?.backgroundImage,
    project.mobileVideo,
  ];
  return candidates.find((url) => isVideoUrl(url)) ?? null;
}

function thumbSrc(project: DonprodProject) {
  return project.thumbDesktop || project.thumbMobile || project.thumbnails?.desktop || "";
}

function gridCell(index: number, count: number) {
  const columns = getColumnCount(count);
  const rows = Math.max(1, Math.ceil(count / columns));
  const col = index % columns;
  const row = Math.floor(index / columns);
  const cellW = (100 - MARGIN_X * 2) / columns;
  const cellH = (100 - MARGIN_Y * 2) / rows;
  const jitterX = row % 2 === 0 ? -cellW * 0.04 : cellW * 0.05;
  const jitterY = col % 2 === 0 ? cellH * 0.04 : -cellH * 0.03;
  return {
    left: MARGIN_X + cellW * (col + 0.5) + jitterX,
    top: MARGIN_Y + cellH * (row + 0.5) + jitterY,
    size: Math.min(cellW * 0.58, 12.4),
  };
}

export function HomeArchiveView({
  projects,
  onTileClick,
  isExiting = false,
}: HomeArchiveViewProps) {
  const [isSpread, setIsSpread] = useState(false);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const count = projects.length;

  useEffect(() => {
    if (isExiting) {
      setIsSpread(false);
      setHoveredSlug(null);
      return;
    }
    setIsSpread(false);
    const timer = window.setTimeout(() => setIsSpread(true), 280);
    return () => window.clearTimeout(timer);
  }, [isExiting, count]);

  const hoveredProject = useMemo(
    () => projects.find((project) => project.slug === hoveredSlug),
    [projects, hoveredSlug],
  );

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease }}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#000",
      }}
    >
      <AnimatePresence mode="wait">
        {hoveredProject && isSpread && !isExiting && (
          <motion.div
            key={hoveredProject.slug}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 6,
              pointerEvents: "none",
            }}
          >
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease }}
              style={{
                color: "#f6f6f6",
                fontFamily: '"Sporty Pro Black", sans-serif',
                fontSize: "clamp(40px, 8.5vw, 140px)",
                lineHeight: 0.82,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                textAlign: "center",
                textShadow: "0 2px 30px rgba(0,0,0,0.6)",
                padding: "0 8vw",
              }}
            >
              {hoveredProject.title}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {projects.map((project, index) => {
        const isHovered = hoveredSlug === project.slug && isSpread;
        const isDimmed = hoveredSlug !== null && !isHovered;
        const videoSrc = previewVideo(project);
        const imageSrc = thumbSrc(project);
        const cell = gridCell(index, count);
        const delay = isSpread ? Math.min(index * 0.028, 0.42) : Math.min(index * 0.012, 0.18);

        return (
          <motion.div
            key={project.slug}
            onMouseEnter={() => setHoveredSlug(project.slug)}
            onMouseLeave={() => setHoveredSlug(null)}
            initial={{
              left: "50%",
              top: "50%",
              width: "clamp(200px, 25.14vw, 362px)",
              height: "20dvh",
              x: "-50%",
              y: "-50%",
              opacity: 1,
              scale: 1,
            }}
            animate={
              isSpread
                ? {
                    left: `${cell.left}%`,
                    top: `${cell.top}%`,
                    width: `${cell.size}vw`,
                    height: `${cell.size}vw`,
                    x: "-50%",
                    y: "-50%",
                    opacity: isDimmed ? 0.16 : 1,
                    scale: isHovered ? 1.06 : 1,
                  }
                : {
                    left: "50%",
                    top: "50%",
                    width: "clamp(200px, 25.14vw, 362px)",
                    height: "20dvh",
                    x: "-50%",
                    y: "-50%",
                    opacity: isExiting ? 0 : 1,
                    scale: isExiting ? 0.92 : 1,
                  }
            }
            transition={{
              left: { duration: 0.95, delay, ease },
              top: { duration: 0.95, delay, ease },
              width: { duration: 0.95, delay, ease },
              height: { duration: 0.95, delay, ease },
              x: { duration: 0.95, delay, ease },
              y: { duration: 0.95, delay, ease },
              scale: { duration: 0.4, ease },
              opacity: { duration: 0.4, delay: isSpread ? delay : 0, ease },
            }}
            style={{
              position: "absolute",
              overflow: "hidden",
              padding: 0,
              border: 0,
              background: "#101010",
              borderRadius: isHovered ? "14px" : "2px",
              cursor: "pointer",
              pointerEvents: isSpread && !isExiting ? "auto" : "none",
              zIndex: isHovered ? 4 : 1,
              boxShadow: isHovered
                ? "0 0 0 1px rgba(246,246,246,.55), inset 0 0 0 6px rgba(18,18,18,.92), inset 0 0 22px rgba(0,0,0,.7)"
                : "none",
            }}
          >
            <Link
              href={`/project/${project.slug.toLowerCase()}`}
              scroll={false}
              aria-label={project.title}
              onClick={(event) => onTileClick?.(project, event.currentTarget)}
              style={{ position: "absolute", inset: 0, zIndex: 5 }}
            />
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: isHovered ? "14px" : "2px",
                overflow: "hidden",
                pointerEvents: "none",
              }}
            >
              {imageSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageSrc}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    objectFit: "cover",
                    filter: isDimmed ? "grayscale(0.35) brightness(0.55)" : "none",
                  }}
                />
              ) : null}
              {isHovered && videoSrc && (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={imageSrc || undefined}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                >
                  <source src={videoSrc} type="video/mp4" />
                </video>
              )}
              {isHovered && (
                <>
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "repeating-linear-gradient(transparent 0 2px, rgba(0,0,0,.18) 2px, rgba(0,0,0,.18) 3px, transparent 3px, transparent 4px)",
                      opacity: 0.52,
                      pointerEvents: "none",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "radial-gradient(ellipse at center, transparent 54%, rgba(0,0,0,.55) 100%)",
                      opacity: 0.42,
                      pointerEvents: "none",
                    }}
                  />
                </>
              )}
            </span>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

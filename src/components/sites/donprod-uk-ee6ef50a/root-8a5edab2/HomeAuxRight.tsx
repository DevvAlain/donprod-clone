"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface HomeAuxRightProps {
  activeProject: { artist: string | null; title: string } | null;
  activeIndex: number;
  totalCount: number;
  viewMode?: "list" | "archive";
  onViewModeChange?: (mode: "list" | "archive") => void;
}

export function HomeAuxRight({
  activeProject,
  activeIndex,
  totalCount,
  viewMode = "list",
  onViewModeChange,
}: HomeAuxRightProps) {
  const [displayArtist, setDisplayArtist] = useState(
    activeProject?.artist ?? " "
  );
  const [displayIndex, setDisplayIndex] = useState(activeIndex);

  const [artistSlide, setArtistSlide] = useState(0);
  const [indexSlide, setIndexSlide] = useState(0);

  const prevIndexRef = useRef(activeIndex);
  const prevArtistRef = useRef(activeProject?.artist ?? " ");

  useEffect(() => {
    const newArtist = activeProject?.artist ?? " ";
    const newIndex = activeIndex;

    if (
      prevIndexRef.current !== newIndex ||
      prevArtistRef.current !== newArtist
    ) {
      // Slide out upward
      setArtistSlide(-100);
      setIndexSlide(-100);

      const timeout = setTimeout(() => {
        // Snap to bottom (hidden below)
        setArtistSlide(100);
        setIndexSlide(100);
        setDisplayArtist(newArtist);
        setDisplayIndex(newIndex);

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Slide in from below
            setArtistSlide(0);
            setIndexSlide(0);
          });
        });
      }, 400);

      prevIndexRef.current = newIndex;
      prevArtistRef.current = newArtist;

      return () => clearTimeout(timeout);
    }
  }, [activeIndex, activeProject]);

  const monoStyle: React.CSSProperties = {
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: "10.8px",
    color: "#f6f6f6",
  };

  // Dots: index 0 = "list", index 1 = active mode indicator, index 2 = "archive"
  // When list mode: dot 0 is bright, others muted
  // When archive mode: dot 2 is bright, others muted
  const dotColors = (i: number): string => {
    if (viewMode === "list") {
      return i === 0 ? "rgb(233, 233, 233)" : i === 1 ? "rgb(154, 154, 154)" : "rgb(100, 100, 100)";
    } else {
      return i === 2 ? "rgb(255, 255, 255)" : i === 1 ? "rgb(154, 154, 154)" : "rgb(100, 100, 100)";
    }
  };

  // Transforms from reference HTML: translate3d(5.5px, y, 0px) scale(0.8125, 0.875)
  const dotTransforms = [
    "translate3d(5.5px, -5px, 0px) scale(0.8125, 0.875)",
    "translate3d(5.5px, 0px, 0px) scale(0.8125, 0.875)",
    "translate3d(5.5px, 5.5px, 0px) scale(0.8125, 0.875)",
  ];

  // Clicking dot 0 -> list mode, dot 2 -> archive mode
  const handleDotClick = (i: number) => {
    if (!onViewModeChange) return;
    if (i === 0) onViewModeChange("list");
    else if (i === 2) onViewModeChange("archive");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        flex: 1,
        minWidth: 0,
        height: "calc(100vh - 40px)",
        position: "relative",
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Display selector dots — absolute, middle-right of column, matching reference HTML transforms */}
      <motion.div
        style={{
          position: "absolute",
          top: "50%",
          right: 0,
          width: "26px",
          height: "48px",
        }}
        initial={{ transform: "translate3d(25px, -50%, 0)" }}
        animate={{ transform: "translate3d(0px, -50%, 0)" }}
        transition={{ delay: 0, duration: 2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "26px",
            height: "48px",
          }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              onClick={() => handleDotClick(i)}
              style={{
                display: "block",
                width: "16px",
                height: "16px",
                transform: dotTransforms[i],
                background: dotColors(i),
                flexShrink: 0,
                cursor: onViewModeChange ? "pointer" : "default",
                transition: "background 0.2s",
                pointerEvents: "auto",
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Artist name */}
      <motion.div
        initial={{ transform: "translateY(100%)" }}
        animate={{ transform: "translateY(0%)" }}
        transition={{ delay: 0.2, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          style={{
            overflow: "hidden",
            height: "18px",
            marginBottom: "4px",
          }}
        >
          <span
            style={{
              ...monoStyle,
              display: "block",
              textTransform: "uppercase",
              transform: `translate3d(0, ${artistSlide}%, 0)`,
              transition: "transform 0.4s ease",
              whiteSpace: "nowrap",
            }}
          >
            {displayArtist}
          </span>
        </div>
      </motion.div>

      {/* Project number */}
      <motion.div
        initial={{ transform: "translateY(100%)" }}
        animate={{ transform: "translateY(0%)" }}
        transition={{ delay: 0.25, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <div style={{ overflow: "hidden", height: "18px" }}>
            <span
              style={{
                ...monoStyle,
                display: "block",
                transform: `translate3d(0, ${indexSlide}%, 0)`,
                transition: "transform 0.4s ease",
              }}
            >
              {String(displayIndex).padStart(2, "0")}
            </span>
          </div>
          <span style={monoStyle}>{` - ${totalCount}`}</span>
        </div>
      </motion.div>
    </div>
  );
}

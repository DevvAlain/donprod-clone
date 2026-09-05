"use client";

import React from "react";
import { motion } from "framer-motion";

interface HomeAuxLeftProps {
  projects: { title: string; tags: number[] }[];
  activeIndex: number;
  totalCount: number;
  activeFilter: number | null;
  onFilterChange: (filter: number | null) => void;
}

export function HomeAuxLeft({
  projects,
  activeIndex,
  totalCount,
  activeFilter,
  onFilterChange,
}: HomeAuxLeftProps) {
  const handleAnalogClick = () => {
    onFilterChange(activeFilter === 1 ? null : 1);
  };

  const handleDigitalClick = () => {
    onFilterChange(activeFilter === 2 ? null : 2);
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
      {/* Scroll progress indicator */}
      <motion.div
        initial={{ transform: "translate3d(-40px, calc(-50% - 8px), 0)" }}
        animate={{ transform: "translate3d(0px, calc(-50% - 8px), 0)" }}
        transition={{ delay: 0.25, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          display: "flex",
          flexDirection: "column",
          gap: "3px",
        }}
      >
        {Array.from({ length: totalCount }, (_, i) => {
          const isActive = i === activeIndex;
          const isAdjacent = i === activeIndex - 1 || i === activeIndex + 1;

          const scaleX = isActive ? 1.75 : isAdjacent ? 1.25 : 1;
          const bg = isActive ? "#f6f6f6" : isAdjacent ? "#868686" : "#2a2a2a";

          return (
            <div key={i}>
              <span
                style={{
                  display: "block",
                  height: "1px",
                  width: "20px",
                  transformOrigin: "left center",
                  transform: `scaleX(${scaleX})`,
                  background: bg,
                  transition: "transform 0.3s ease, background 0.3s ease",
                }}
              />
            </div>
          );
        })}
      </motion.div>

      {/* Bottom row: project title right-aligned */}
      <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end", height: "13px", overflow: "hidden" }}>
        <motion.span
          className="video_name"
          initial={{ translateY: "100%" }}
          animate={{ translateY: "0%" }}
          transition={{ delay: 0.2, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: "block",
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: "10.8px",
            color: "#f6f6f6",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {projects[activeIndex]?.title ?? ""}
        </motion.span>
      </div>

      {/* ANALOG / DIGITAL — transform-slide, matching original .mode_adjust_wrapper structure */}
      <motion.div
        initial={{ transform: "translate3d(0, 100%, 0)" }}
        animate={{ transform: "translate3d(0, 0%, 0)" }}
        transition={{ delay: 0.5, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      >
      <div
        className="mode_adjust_wrapper"
        style={{ position: "relative", height: "13px", marginTop: "2px" }}
      >
        {/* ANALOG: hidden below (y=100%) by default, slides up when ANALOG filter active */}
        <div
          className="mode_adjust_ovr"
          onClick={handleAnalogClick}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            overflow: "hidden",
            height: "13px",
            cursor: "pointer",
            pointerEvents: "auto",
          }}
        >
          <span
            style={{
              display: "block",
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: "10.8px",
              color: "#f6f6f6",
              transform: `translate3d(0px, ${activeFilter === 1 ? "0%" : "100%"}, 0px)`,
              transition: "transform 0.4s ease",
              whiteSpace: "nowrap",
            }}
          >
            ANALOG
          </span>
        </div>
        {/* DIGITAL: visible (y=0%) by default, slides up (y=-100%) when ANALOG filter active */}
        <div
          className="mode_adjust_ovr"
          onClick={handleDigitalClick}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            overflow: "hidden",
            height: "13px",
            cursor: "pointer",
            pointerEvents: "auto",
          }}
        >
          <span
            style={{
              display: "block",
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: "10.8px",
              color: "#f6f6f6",
              transform: `translate3d(0px, ${activeFilter === 1 ? "-100%" : "0%"}, 0px)`,
              transition: "transform 0.4s ease",
              whiteSpace: "nowrap",
            }}
          >
            DIGITAL
          </span>
        </div>
      </div>
      </motion.div>
    </div>
  );
}

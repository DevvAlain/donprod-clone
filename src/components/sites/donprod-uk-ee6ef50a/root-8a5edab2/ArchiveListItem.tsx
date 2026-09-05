"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DonprodProject } from "@/types/donprod";

interface ArchiveListItemProps {
  item: DonprodProject;
  idx: number;
  activeIdx: number;
  activeFilter: number;
  isFiltered: boolean;
  archiveElementRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  handleEleClicked: (idx: number) => void;
}

// Entrance/exit animation for .a_li_wrapper — archv_it has overflow:hidden so it clips the slide
const liVariants = {
  initial: { y: "100%", opacity: 0 },
  animate: (i: number) => ({
    opacity: 1,
    y: "0%",
    transition: {
      duration: 1,
      delay: 0.015 * i,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  }),
  exit: (i: number) => ({
    y: "100%",
    opacity: 0,
    transition: {
      duration: 1,
      delay: 0.01 * i,
      ease: [0.65, 0, 0.35, 1] as [number, number, number, number],
    },
  }),
};

// bg-slider: scales from 0 → 1 on hover (scaleX with transform-origin left/right)
const bgSliderVariants = {
  initial: { scaleX: 0 },
  animate: {
    scaleX: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
  exit: {
    scaleX: 0,
    transition: { duration: 0.3 },
  },
};

function formatRunTime(runTime: [number, number]): string {
  const [mins, secs] = runTime;
  const mStr = mins < 10 ? `0${mins}` : `${mins}`;
  const sStr = secs < 10 ? `0${secs}` : `${secs}`;
  return `${mStr}:${sStr}`;
}

export function ArchiveListItem({
  item,
  idx,
  activeIdx,
  isFiltered,
  archiveElementRefs,
  onMouseEnter,
  onMouseLeave,
  handleEleClicked,
}: ArchiveListItemProps) {
  const [isHovering, setIsHovering] = useState(false);
  const isActive = activeIdx === idx;
  const runTimeStr = formatRunTime(item.meta.runTime);
  // Display number: [01], [02], …
  const displayNum = idx < 9 ? `0${idx + 1}` : `${idx + 1}`;

  const handleEnter = () => {
    setIsHovering(true);
    onMouseEnter();
  };

  const handleLeave = () => {
    setIsHovering(false);
    onMouseLeave();
  };

  const showHighlight = isHovering || isActive;

  return (
    // .archv_it — position: relative; width: 100%; display: flex; overflow: hidden;
    // .archive_list_wrapper > .archv_it { flex-basis: 30px; min-height: 30px; }
    // pointer-events: all overrides the parent archive_list_wrapper's pointer-events: none
    <div
      ref={(el) => {
        archiveElementRefs.current[idx] = el;
      }}
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        overflow: "hidden",
        flexBasis: "30px",
        minHeight: "30px",
        pointerEvents: isFiltered ? "none" : "all",
        opacity: isFiltered ? 0.2 : 1,
        transition: "opacity 0.4s ease",
        cursor: "pointer",
        borderBottom: "1px solid rgba(246,246,246,0.08)",
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={() => handleEleClicked(idx)}
    >
      {/* .a_li_wrapper (+ .p_selected when active)
          align-items: center; color: var(--light-color); display: flex;
          flex-direction: row; white-space: nowrap; width: 100%; */}
      <motion.div
        variants={liVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        custom={idx}
        style={{
          alignItems: "center",
          color: "#f6f6f6",
          display: "flex",
          flexDirection: "row",
          whiteSpace: "nowrap",
          width: "100%",
          fontFamily: '"IBM Plex Mono", monospace',
          fontWeight: 500,
          fontSize: "10.8px",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          minHeight: "30px",
          // p_selected = opacity 1, non-selected = 0.5 (transition: 0.35s)
          opacity: showHighlight ? 1 : 0.5,
          transition: "opacity 0.35s ease",
          position: "relative",
        }}
      >
        {/* .li_first_col — position: relative; width: 20%
            .a_li_wrapper > div { display: inline-block; mix-blend-mode: difference; } */}
        <div
          style={{
            position: "relative",
            width: "20%",
            display: "inline-block",
            mixBlendMode: "difference",
          }}
        >
          {/* .li_number_wrap .mix-dif */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              position: "relative",
              overflow: "hidden",
              mixBlendMode: "difference",
            }}
          >
            {/* .bg-slider .sldr-l .bg-slide-hov .mix-dif
                position: absolute; inset: 0; background: white;
                mix-blend-mode: difference; transform-origin: left center;
                scaleX: 0 → 1 on hover */}
            <AnimatePresence>
              {showHighlight && (
                <motion.div
                  key="bg-l"
                  variants={bgSliderVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "white",
                    mixBlendMode: "difference",
                    transformOrigin: "left center",
                  }}
                />
              )}
            </AnimatePresence>
            {/* Number spans: <span style="padding-left: 20px;">[</span><span>01</span><span style="padding-right: 20px;">]</span> */}
            <span style={{ paddingLeft: "20px" }}>[</span>
            <span>{displayNum}</span>
            <span style={{ paddingRight: "20px" }}>]</span>
          </div>
        </div>

        {/* .p_n — width: 25%
            .a_li_wrapper > div { display: inline-block; mix-blend-mode: difference; } */}
        <div
          style={{
            width: "25%",
            display: "inline-block",
            mixBlendMode: "difference",
          }}
        >
          {item.title}
        </div>

        {/* .p-an — width: 25%
            .a_li_wrapper > div { display: inline-block; mix-blend-mode: difference; } */}
        <div
          style={{
            width: "25%",
            display: "inline-block",
            mixBlendMode: "difference",
          }}
        >
          {item.artist ?? ""}
        </div>

        {/* .p-loc — empty, fills remaining space */}
        <div
          style={{
            display: "inline-block",
            mixBlendMode: "difference",
            flex: 1,
          }}
        />

        {/* .li_last_col — position: absolute; right: 0;
            .a_li_wrapper > div { display: inline-block; mix-blend-mode: difference; } */}
        <div
          style={{
            position: "absolute",
            right: 0,
            display: "inline-block",
            mixBlendMode: "difference",
          }}
        >
          {/* .p_rt — padding: 0 20px; text-align: right; */}
          <div
            style={{
              padding: "0 20px",
              textAlign: "right",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
            }}
          >
            {/* .bg-slider .sldr-r .bg-slide-hov .mix-dif
                position: absolute; inset: 0; background: white;
                mix-blend-mode: difference; transform-origin: right center; */}
            <AnimatePresence>
              {showHighlight && (
                <motion.div
                  key="bg-r"
                  variants={bgSliderVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "white",
                    mixBlendMode: "difference",
                    transformOrigin: "right center",
                  }}
                />
              )}
            </AnimatePresence>
            <span style={{ position: "relative", zIndex: 1 }}>{runTimeStr}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

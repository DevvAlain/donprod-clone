"use client";

import { motion } from "framer-motion";
import { DonprodProject } from "@/types/donprod";

interface MobArchiveListItemProps {
  item: DonprodProject;
  idx: number;
  activeIdx: number;
  isInFilter: boolean;
  handleMobLiClick: (idx: number) => void;
  mobileElementRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

function formatRunTime(runTime: [number, number]): string {
  const [mins, secs] = runTime;
  const mStr = mins < 10 ? `0${mins}` : `${mins}`;
  const sStr = secs < 10 ? `0${secs}` : `${secs}`;
  return `${mStr}:${sStr}`;
}

const slide = (delay: number) => ({
  initial: { y: "100%", opacity: 0 },
  animate: {
    y: "0%",
    opacity: 1,
    transition: { delay, duration: 1.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
  exit: {
    y: "100%",
    transition: { duration: 0.75, delay: 0.025, ease: [0.76, 0, 0.24, 1] as [number, number, number, number] },
  },
});

export function MobArchiveListItem({
  item,
  idx,
  isInFilter,
  handleMobLiClick,
  mobileElementRefs,
}: MobArchiveListItemProps) {
  const runTimeStr = formatRunTime(item.meta.runTime);

  return (
    <div
      ref={(el) => {
        mobileElementRefs.current[idx] = el;
      }}
      className="mob_archv_li"
      onClick={() => handleMobLiClick(idx)}
      style={{
        opacity: isInFilter ? 1 : 0.25,
        pointerEvents: isInFilter ? "auto" : "none",
        position: "relative",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 50,
        overflow: "hidden",
        mixBlendMode: "difference",
        fontFamily: '"IBM Plex Mono", monospace',
        color: "#f6f6f6",
        fontSize: 11,
        textTransform: "uppercase",
        cursor: "pointer",
        transition: "opacity 0.3s ease",
      }}
    >
      <div
        className="mob_li_content"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          padding: "0 20px",
          mixBlendMode: "difference",
        }}
      >
        <div style={{ overflow: "hidden", width: "10%", flexShrink: 0 }}>
          <motion.span {...slide(0.25 + 0.025 * idx)} style={{ display: "inline-block" }}>
            {idx < 9 ? "0" : ""}
            {idx + 1}
          </motion.span>
        </div>
        <div style={{ overflow: "hidden" }}>
          <motion.span
            {...slide(0.275 + 0.025 * idx)}
            style={{ display: "inline-block", fontWeight: 700 }}
          >
            {item.title}
          </motion.span>
        </div>
        <div style={{ overflow: "hidden" }}>
          <motion.span
            {...slide(0.285 + 0.025 * idx)}
            style={{ display: "inline-block", fontStyle: "italic", paddingLeft: 10 }}
          >
            {item.artist ?? ""}
          </motion.span>
        </div>
        <div style={{ overflow: "hidden", position: "absolute", right: 20 }}>
          <motion.span {...slide(0.295 + 0.025 * idx)} style={{ display: "inline-block" }}>
            {runTimeStr}
          </motion.span>
        </div>
      </div>
    </div>
  );
}

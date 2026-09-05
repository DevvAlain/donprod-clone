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
      onClick={() => handleMobLiClick(idx)}
      style={{
        opacity: isInFilter ? 1 : 0.25,
        pointerEvents: isInFilter ? "auto" : "none",
        padding: "0.9em 20px",
        borderBottom: "1px solid rgba(246,246,246,0.12)",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "1em",
        cursor: "pointer",
        fontFamily: '"IBM Plex Mono", monospace',
        color: "var(--light-color)",
        fontSize: "clamp(10px, 3.2vw, 13px)",
        letterSpacing: "0.04em",
        transition: "opacity 0.3s ease",
      }}
    >
      {/* Index number */}
      <div style={{ overflow: "hidden", flexShrink: 0, width: "2.2em" }}>
        <motion.span
          initial={{ y: "100%", opacity: 0 }}
          animate={{
            y: "0%",
            opacity: 1,
            transition: {
              delay: 0.25 + 0.025 * idx,
              duration: 1.5,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            },
          }}
          exit={{
            y: "100%",
            transition: {
              duration: 0.75,
              delay: 0.025 * idx,
              ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
            },
          }}
          style={{ display: "block" }}
        >
          {idx < 9 ? "0" : ""}{idx + 1}
        </motion.span>
      </div>

      {/* Title */}
      <div style={{ overflow: "hidden", flex: "1 1 0" }}>
        <motion.span
          initial={{ y: "100%", opacity: 0 }}
          animate={{
            y: "0%",
            opacity: 1,
            transition: {
              delay: 0.25 + 0.025 + 0.025 * idx,
              duration: 1.5,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            },
          }}
          exit={{
            y: "100%",
            transition: {
              duration: 0.75,
              delay: 0.025 * idx,
              ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
            },
          }}
          style={{
            display: "block",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          &apos;{item.title}&apos;
        </motion.span>
      </div>

      {/* Artist */}
      <div style={{ overflow: "hidden", flex: "0 0 auto", opacity: 0.65 }}>
        <motion.span
          initial={{ y: "100%", opacity: 0 }}
          animate={{
            y: "0%",
            opacity: 1,
            transition: {
              delay: 0.25 + 0.035 + 0.025 * idx,
              duration: 2,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            },
          }}
          exit={{
            y: "100%",
            transition: {
              duration: 0.75,
              delay: 0.025 * idx,
              ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
            },
          }}
          style={{ display: "block" }}
        >
          {item.artist ?? ""}
        </motion.span>
      </div>

      {/* Runtime */}
      <div style={{ overflow: "hidden", flex: "0 0 auto", opacity: 0.5 }}>
        <motion.span
          initial={{ y: "100%", opacity: 0 }}
          animate={{
            y: "0%",
            opacity: 1,
            transition: {
              delay: 0.25 + 0.045 + 0.025 * idx,
              duration: 1.5,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            },
          }}
          exit={{
            y: "100%",
            transition: {
              duration: 0.75,
              delay: 0.025 * idx,
              ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
            },
          }}
          style={{ display: "block" }}
        >
          {runTimeStr}
        </motion.span>
      </div>
    </div>
  );
}

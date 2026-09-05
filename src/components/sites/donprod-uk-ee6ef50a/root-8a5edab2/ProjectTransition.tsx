"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  thumbSrc: string;
  placeholderSrc: string;
  onAnimationEnd: () => void;
}

interface Dims {
  startW: number;
  startH: number;
  scaleX: number;
  scaleY: number;
  upperY: number;   // translateY for upper horiz line (from top:60px to tile top)
  lowerY: number;   // translateY for lower horiz line (negative, from bottom line to tile bottom)
  leftX: number;    // translateX for left vert line (from left:70px to tile left edge)
  rightX: number;   // translateX for right vert line (negative)
  targetH: number;  // for lower horiz absolute top position
}

function calcDims(): Dims {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const gutter = 70; // padding: 60px 70px 120px
  const targetW = vw - gutter * 2;
  const targetH = Math.min(targetW * (9 / 16), vh - 180);
  const startH = vh / 5 - 20;
  const startW = 1.9 * (vh / 5);
  const scaleX = targetW / startW;
  const scaleY = targetH / startH;

  // Upper horiz: starts translated to tile top edge, animates to top:60px (translate=0)
  // Tile top edge in viewport = vh/2 - startH/2
  // Distance from top:60px to tile top edge = (vh/2 - startH/2) - 60
  const upperY = vh / 2 - startH / 2 - 60;

  // Lower horiz: at top = 60 + targetH, starts translated to tile bottom edge
  // Tile bottom in viewport = vh/2 + startH/2
  // Distance = (60 + targetH) - (vh/2 + startH/2)
  const lowerY = -1 * ((60 + targetH) - (vh / 2 + startH / 2));

  // Left vert: starts translated to tile left edge from left:70px
  // Tile left edge = vw/2 - startW/2
  // Distance from left:70px = (vw/2 - startW/2) - 70
  const leftX = vw / 2 - startW / 2 - 70;

  // Right vert: from right:70px to tile right edge
  // rightX is negative (moves right)
  const rightX = -1 * (vw / 2 - startW / 2 - 70);

  return { startW, startH, scaleX, scaleY, upperY, lowerY, leftX, rightX, targetH };
}

export function ProjectTransition({ thumbSrc, placeholderSrc, onAnimationEnd }: Props) {
  const [dims, setDims] = useState<Dims | null>(null);
  const [phase, setPhase] = useState<"expand" | "done">("expand");

  useEffect(() => {
    setDims(calcDims());
    // Navigate after the thumbnail expand animation completes (~1.75s)
    const t = setTimeout(() => {
      setPhase("done");
      onAnimationEnd();
    }, 1500);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!dims) return null;

  const { startW, startH, scaleX, scaleY, upperY, lowerY, leftX, rightX, targetH } = dims;

  // Grid line shared styles
  const lineBase: React.CSSProperties = {
    position: "fixed",
    background: "var(--light-color, #f6f6f6)",
    pointerEvents: "none",
    zIndex: 99,
  };

  const horizLine: React.CSSProperties = { ...lineBase, left: 0, width: "100%", height: 1 };
  const vertLine: React.CSSProperties = { ...lineBase, top: 0, height: "100%", width: 1 };

  // Grid line timing: expand (scale 0→1) then slide to final position
  // Total: 2.5s, grid snap at 1.5s, grid expand at 1.0s
  const lineTransition = {
    duration: 2.5,
    delay: 0,
    times: [0, 0.6, 1],
    ease: [
      [0.85, 0, 0.15, 1] as [number, number, number, number],
      [0.16, 1, 0.3, 1] as [number, number, number, number],
      [0.16, 1, 0.3, 1] as [number, number, number, number],
    ],
  };

  return (
    <>
      {/* Thumbnail morph overlay */}
      <motion.div
        className="proj_transition__wrapper"
        style={{
          position: "fixed",
          top: 60,
          left: "50%",
          width: startW,
          height: startH,
          zIndex: 100,
          overflow: "hidden",
          transformOrigin: "top center",
          pointerEvents: "none",
        }}
        initial={{
          opacity: 0,
          transform: "translate(-50%, calc(50vh - 60px - 50%))",
        }}
        animate={{
          opacity: 1,
          transform: `translate(-50%, 0) scale(${scaleX}, ${scaleY})`,
          transition: {
            duration: 1.25,
            delay: 0.15,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            opacity: {
              delay: 0.05,
              duration: 0.25,
              ease: [0.87, 0, 0.13, 1] as [number, number, number, number],
            },
          },
        }}
      >
        {/* Placeholder (blurred) — renders immediately */}
        <motion.img
          src={placeholderSrc}
          style={{ position: "absolute", width: "100%", height: "auto", filter: "blur(5px)" }}
          initial={{ transform: `scale(1, 1)` }}
          animate={{
            transform: `scale(1, ${scaleX / scaleY})`,
            transition: { duration: 1.25, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
          }}
        />
        {/* Full quality thumb */}
        <motion.img
          src={thumbSrc}
          style={{ position: "absolute", width: "100%", height: "auto" }}
          initial={{ opacity: 0, transform: `scale(1, 1)` }}
          animate={{
            opacity: 1,
            transform: `scale(1, ${scaleX / scaleY})`,
            transition: {
              duration: 1.25,
              delay: 0.15,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              opacity: { delay: 0.4, duration: 0.4 },
            },
          }}
        />
      </motion.div>

      {/* Upper horizontal grid line — slides from tile-top down to top:60px */}
      <motion.div
        style={{ ...horizLine, top: 60 }}
        initial={{ transform: `scale(0, 1) translate3d(0, ${upperY}px, 0)` }}
        animate={{
          transform: [
            `scale(0, 1) translate3d(0, ${upperY}px, 0)`,
            `scale(1, 1) translate3d(0, ${upperY}px, 0)`,
            `scale(1, 1) translate3d(0, 0px, 0)`,
          ],
          transition: lineTransition,
        }}
      />

      {/* Lower horizontal grid line — slides from tile-bottom up to top:60+targetH */}
      <motion.div
        style={{ ...horizLine, top: 60 + targetH }}
        initial={{ transform: `scale(0, 1) translate3d(0, ${lowerY}px, 0)` }}
        animate={{
          transform: [
            `scale(0, 1) translate3d(0, ${lowerY}px, 0)`,
            `scale(1, 1) translate3d(0, ${lowerY}px, 0)`,
            `scale(1, 1) translate3d(0, 0px, 0)`,
          ],
          transition: lineTransition,
        }}
      />

      {/* Left vertical grid line — slides from tile-left edge to left:70px */}
      <motion.div
        style={{ ...vertLine, left: 70 }}
        initial={{ transform: `scale(1, 0) translate3d(${leftX}px, 0, 0)` }}
        animate={{
          transform: [
            `scale(1, 0) translate3d(${leftX}px, 0, 0)`,
            `scale(1, 1) translate3d(${leftX}px, 0, 0)`,
            `scale(1, 1) translate3d(0px, 0, 0)`,
          ],
          transition: lineTransition,
        }}
      />

      {/* Right vertical grid line — slides from tile-right edge to right:70px */}
      <motion.div
        style={{ ...vertLine, right: 70 }}
        initial={{ transform: `scale(1, 0) translate3d(${rightX}px, 0, 0)` }}
        animate={{
          transform: [
            `scale(1, 0) translate3d(${rightX}px, 0, 0)`,
            `scale(1, 1) translate3d(${rightX}px, 0, 0)`,
            `scale(1, 1) translate3d(0px, 0, 0)`,
          ],
          transition: lineTransition,
        }}
      />
    </>
  );
}

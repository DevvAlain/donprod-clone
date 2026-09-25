"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export interface TransitionOrigin {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  thumbSrc: string;
  placeholderSrc: string;
  fromRect?: TransitionOrigin | null;
  onAnimationEnd: () => void;
}

interface Dims {
  startW: number;
  startH: number;
  origin: TransitionOrigin;
  targetX: number;
  targetY: number;
  targetW: number;
  targetH: number;
  centerX: number;
  centerY: number;
  upperY: number;
  lowerY: number;
  leftX: number;
  rightX: number;
}

function copyRect(rect?: TransitionOrigin | null): TransitionOrigin | null {
  if (!rect) return null;
  return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
}

function calcDims(from?: TransitionOrigin | null): Dims {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const gutter = 70;
  const targetX = gutter;
  const targetY = 60;
  const targetW = vw - gutter * 2;
  const targetH = Math.min(targetW * (9 / 16), vh - 180);
  const startH = vh / 5 - 20;
  const startW = 1.9 * (vh / 5);
  const centerX = (vw - startW) / 2;
  const centerY = (vh - startH) / 2;
  const origin = from && from.width > 8 && from.height > 8
    ? from
    : { x: centerX, y: centerY, width: startW, height: startH };

  const upperY = vh / 2 - startH / 2 - 60;
  const lowerY = -1 * ((60 + targetH) - (vh / 2 + startH / 2));
  const leftX = vw / 2 - startW / 2 - 70;
  const rightX = -1 * (vw / 2 - startW / 2 - 70);

  return { startW, startH, origin, targetX, targetY, targetW, targetH, centerX, centerY, upperY, lowerY, leftX, rightX };
}

export function ProjectTransition({ thumbSrc, placeholderSrc, fromRect, onAnimationEnd }: Props) {
  const [dims, setDims] = useState<Dims | null>(null);

  useEffect(() => {
    setDims(calcDims(copyRect(fromRect)));
    const t = setTimeout(() => onAnimationEnd(), 1550);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!dims) return null;

  const { startW, startH, origin, targetX, targetY, targetW, targetH, centerX, centerY, upperY, lowerY, leftX, rightX } = dims;

  const lineBase: React.CSSProperties = {
    position: "fixed",
    background: "var(--light-color, #f6f6f6)",
    pointerEvents: "none",
    zIndex: 99,
  };

  const horizLine: React.CSSProperties = { ...lineBase, left: 0, width: "100%", height: 1 };
  const vertLine: React.CSSProperties = { ...lineBase, top: 0, height: "100%", width: 1 };

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

  const morphEase = [0.16, 1, 0.3, 1] as [number, number, number, number];

  return (
    <>
      <div
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, zIndex: 98, pointerEvents: "auto" }}
      />
      <motion.div
        className="proj_transition__wrapper"
        style={{
          position: "fixed",
          zIndex: 100,
          overflow: "hidden",
          pointerEvents: "none",
          background: "#000",
        }}
        initial={{
          left: origin.x,
          top: origin.y,
          width: origin.width,
          height: origin.height,
          opacity: 1,
        }}
        animate={{
          left: [origin.x, centerX, targetX],
          top: [origin.y, centerY, targetY],
          width: [origin.width, startW, targetW],
          height: [origin.height, startH, targetH],
        }}
        transition={{
          duration: 1.35,
          times: [0, 0.38, 1],
          ease: morphEase,
        }}
      >
        <motion.img
          src={placeholderSrc || thumbSrc}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(5px)" }}
        />
        <motion.img
          src={thumbSrc}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        />
      </motion.div>

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

"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroAnimationProps {
  onComplete: () => void;
}

const CSS_KEYFRAMES = `
@keyframes firstCharTransition {
  0%   { opacity: 0; transform: translateX(100%) rotateY(90deg) rotateX(0deg) rotate(0deg); }
  50%  { opacity: 1; transform: translateX(0) rotateY(0) rotateX(0) rotate(0); }
  100% { opacity: 0.5; transform: translateY(-100%) rotateY(0) rotateX(0) rotate(0); }
}
@keyframes fromBottomOutRight {
  0%   { opacity: 0; transform: translateY(100%) rotateY(0) rotateX(-90deg) rotate(0); }
  50%  { opacity: 1; transform: translateY(0) rotateY(0) rotateX(0) rotate(0); }
  100% { opacity: 0.5; transform: translateX(100%) rotateY(90deg) rotateX(0) rotate(0); }
}
@keyframes fromLeftOutTop {
  0%   { opacity: 0; transform: translateX(-100%) rotateY(-90deg) rotateX(0) rotate(0); }
  50%  { opacity: 1; transform: translateX(0) rotateY(0) rotateX(0) rotate(0); }
  100% { opacity: 0.5; transform: translateY(-100%) rotateY(0) rotateX(0) rotate(0); }
}
@keyframes fromBottomOutLeft {
  0%   { opacity: 0; transform: translateY(100%) rotateY(0) rotateX(-90deg) rotate(0); }
  50%  { opacity: 1; transform: translateY(0) rotateY(0) rotateX(0) rotate(0); }
  100% { opacity: 0.5; transform: translateX(-100%) rotateY(-90deg) rotateX(0) rotate(0); }
}
@keyframes fromRightOutTop {
  0%   { opacity: 0; transform: translateX(100%) rotateY(90deg) rotateX(0) rotate(0); }
  50%  { opacity: 1; transform: translateX(0) rotateY(0) rotateX(0) rotate(0); }
  100% { opacity: 0.5; transform: translateY(-100%) rotateY(0) rotateX(0) rotate(0); }
}
`;

const LETTER_CONFIGS: Array<{ char: string; anim: string; delay: number }> = [
  { char: "D", anim: "firstCharTransition",  delay: 0   },
  { char: "O", anim: "fromBottomOutRight",   delay: 0.6 },
  { char: "N", anim: "fromLeftOutTop",       delay: 1.2 },
  { char: "P", anim: "fromBottomOutLeft",    delay: 1.8 },
  { char: "R", anim: "fromRightOutTop",      delay: 2.4 },
  { char: "O", anim: "fromBottomOutLeft",    delay: 3.0 },
  { char: "D", anim: "fromRightOutTop",      delay: 3.6 },
];

function easeInOutExpo(x: number): number {
  if (x === 0) return 0;
  if (x === 1) return 1;
  if (x < 0.5) return Math.pow(2, 20 * x - 10) / 2;
  return (2 - Math.pow(2, -20 * x + 10)) / 2;
}

const VIDEO_IN_START = 4.7;
const COUNTER_DURATION = VIDEO_IN_START - 1; // 3.7s

const EASE_SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_OUT:   [number, number, number, number] = [0.87, 0, 0.13, 1];

const posterTextVariants = {
  initial: { y: "100%" },
  animate: (i: number) => ({
    y: "0%",
    transition: { duration: 2, delay: 0.25 + 0.1 * i, ease: EASE_SPRING },
  }),
  exit: (i: number) => ({
    y: "100%",
    opacity: 0,
    transition: { duration: 1, delay: 0.1 * i, ease: EASE_OUT },
  }),
};

const posterTextCenterVariants = {
  initial: { x: "-50%", y: "100%" },
  animate: {
    x: "-50%",
    y: "0%",
    transition: { duration: 2, delay: 0.35, ease: EASE_SPRING },
  },
  exit: {
    x: "-50%",
    y: "100%",
    opacity: 0,
    transition: { duration: 1, delay: 0.1, ease: EASE_OUT },
  },
};

const percentVariants = {
  initial: { y: "100%" },
  animate: (i: number) => ({
    y: "0%",
    transition: { duration: 2, delay: 0.25 + 0.1 * i, ease: EASE_SPRING },
  }),
  exit: (i: number) => ({
    y: "100%",
    opacity: 0,
    transition: { duration: 0.7, delay: 1 + 0.1 * i, ease: EASE_OUT },
  }),
};

const DiamondSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="5"
    height="5"
    viewBox="0 0 13 13"
    fill="none"
  >
    <path
      d="M6.66 12.692L0.612 6.656L6.66 0.607999L12.696 6.656L6.66 12.692Z"
      fill="white"
    />
  </svg>
);

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [percentVal, setPercentVal] = useState(0);
  const [animOutContent, setAnimOutContent] = useState(false);
  const [wrapperVisible, setWrapperVisible] = useState(true);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    function tick(now: number) {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const elapsed = (now - startTimeRef.current) / 1000; // seconds

      const prog = Math.min(elapsed / COUNTER_DURATION, 1);
      const curveProg = easeInOutExpo(prog);

      if (curveProg >= 0.99 && !doneRef.current) {
        doneRef.current = true;
        setAnimOutContent(true);
        setTimeout(() => setPercentVal(100), 500);
        // fade out wrapper after videoInStart
        const remaining = Math.max((VIDEO_IN_START - elapsed) * 1000, 0);
        setTimeout(() => {
          setWrapperVisible(false);
          setTimeout(onComplete, 600);
        }, remaining + 300);
        return;
      }

      let display: number;
      if (curveProg < 0.1) {
        display = Math.floor((100 * curveProg) / 1.5);
      } else if (curveProg > 0.4 && curveProg < 0.85) {
        const delta = curveProg - 0.4;
        display = Math.floor((0.42 + (delta / 0.45) * 0.05) * 100);
      } else {
        display = Math.floor(curveProg * 100);
      }

      setPercentVal(display);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [onComplete]);

  return (
    <>
      <style>{CSS_KEYFRAMES}</style>

      {/* Outer clipper — fades out at the end */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100dvh",
          zIndex: 1000,
          opacity: wrapperVisible ? 1 : 0,
          transition: "opacity 0.6s ease",
          pointerEvents: wrapperVisible ? "all" : "none",
          background: "#000",
        }}
      >
        {/* Layer 1 — Cube animation */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100dvh",
            mixBlendMode: "difference",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* loader-cube: 60×60 relative container for all letters stacked */}
            <div
              style={{
                position: "relative",
                width: 60,
                height: 60,
              }}
            >
              {LETTER_CONFIGS.map(({ char, anim, delay }, idx) => (
                <div
                  key={idx}
                  className="loader-char"
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    lineHeight: 1,
                    animationName: anim,
                    animationDuration: "1.2s",
                    animationDelay: `${delay}s`,
                    animationFillMode: "both",
                    animationTimingFunction: "cubic-bezier(0.83, 0, 0.17, 1)",
                    fontFamily: '"Sporty Pro Black", sans-serif',
                    fontSize: 60,
                    color: "#fff",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "53%",
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {char}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Layer 2 — Percentage counter */}
        <div
          style={{
            position: "absolute",
            top: "calc(50% + 60px)",
            left: 0,
            width: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            mixBlendMode: "difference",
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 12,
            fontWeight: 900,
            color: "#fff",
            zIndex: 1000,
          }}
        >
          <div style={{ overflow: "hidden", height: 16, display: "flex" }}>
            <AnimatePresence mode="wait">
              {!animOutContent && (
                <>
                  <motion.span
                    key="num"
                    custom={0}
                    variants={percentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    style={{ display: "inline-block" }}
                  >
                    {percentVal}
                  </motion.span>
                  <motion.span
                    key="pct"
                    custom={1}
                    variants={percentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    style={{ display: "inline-block" }}
                  >
                    %
                  </motion.span>
                </>
              )}
              {animOutContent && (
                <>
                  <motion.span
                    key="num-100"
                    custom={0}
                    variants={percentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    style={{ display: "inline-block" }}
                  >
                    100
                  </motion.span>
                  <motion.span
                    key="pct-100"
                    custom={1}
                    variants={percentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    style={{ display: "inline-block" }}
                  >
                    %
                  </motion.span>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Layer 3 — Poster text */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100dvh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 20,
            mixBlendMode: "difference",
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 12,
            fontWeight: 500,
            color: "#fff",
            zIndex: 1000,
            boxSizing: "border-box",
          }}
        >
          {/* Top row */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Left: DIRECTOR SHOWCASE + diamonds */}
            <div style={{ overflow: "hidden" }}>
              <motion.span
                custom={0}
                variants={posterTextVariants}
                initial="initial"
                animate={animOutContent ? "exit" : "animate"}
                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                DIRECTOR SHOWCASE
                <DiamondSVG />
                <DiamondSVG />
              </motion.span>
            </div>

            {/* Center: DOUBLE OR NOTHING (absolutely positioned) */}
            <motion.span
              custom={1}
              variants={posterTextCenterVariants}
              initial="initial"
              animate={animOutContent ? "exit" : "animate"}
              style={{
                position: "absolute",
                left: "50%",
                display: "inline-block",
                whiteSpace: "nowrap",
              }}
            >
              DOUBLE OR{" "}
              <span style={{ position: "relative", display: "inline-block" }}>
                NOTHING
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={animOutContent ? { scaleX: 0 } : { scaleX: 1 }}
                  transition={{ delay: 1.5, duration: 0.4, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    width: "100%",
                    height: 2,
                    background: "#c11012",
                    transform: "translate3d(0,-50%,0)",
                    transformOrigin: "left center",
                    display: "block",
                  }}
                />
              </span>
            </motion.span>

            {/* Right: diamonds + 2023 - 2026 */}
            <div style={{ overflow: "hidden" }}>
              <motion.span
                custom={2}
                variants={posterTextVariants}
                initial="initial"
                animate={animOutContent ? "exit" : "animate"}
                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                <DiamondSVG />
                <DiamondSVG />
                2023 - 2026
              </motion.span>
            </div>
          </div>

          {/* Bottom row */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
              overflow: "hidden",
            }}
          >
            {/* Left: BORN RISK TAKERS */}
            <div style={{ overflow: "hidden" }}>
              <motion.span
                custom={3}
                variants={posterTextVariants}
                initial="initial"
                animate={animOutContent ? "exit" : "animate"}
                style={{ display: "inline-block" }}
              >
                BORN{" "}
                <span style={{ color: "#c11012" }}>RISK</span>
                {" "}TAKERS
              </motion.span>
            </div>

            {/* Right: @DONPROD */}
            <div style={{ overflow: "hidden" }}>
              <motion.span
                custom={4}
                variants={posterTextVariants}
                initial="initial"
                animate={animOutContent ? "exit" : "animate"}
                style={{ display: "inline-block" }}
              >
                @DONPROD
              </motion.span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

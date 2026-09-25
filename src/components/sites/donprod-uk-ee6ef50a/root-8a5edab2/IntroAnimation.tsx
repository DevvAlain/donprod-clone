"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroAnimationProps {
  onComplete: () => void;
}

const CSS_KEYFRAMES = `
@keyframes firstCharTransition {
  0%  { opacity: 0; transform: translateX(100%) rotateY(90deg) rotateX(0deg) rotate(0deg); }
  50% { opacity: 1; transform: translateX(0) rotateY(0deg) rotateX(0deg) rotate(0deg); }
  100% { opacity: 1; transform: translateX(0) rotateY(0deg) rotateX(0deg) rotate(0deg); }
}
@keyframes fromBottomOutRight {
  0%  { opacity: 0; transform: translateY(100%) rotateY(0deg) rotateX(-90deg) rotate(0deg); }
  50% { opacity: 1; transform: translateY(0) rotateY(0deg) rotateX(0deg) rotate(0deg); }
  100% { opacity: 1; transform: translateY(0) rotateY(0deg) rotateX(0deg) rotate(0deg); }
}
@keyframes fromLeftOutTop {
  0%  { opacity: 0; transform: translateX(-100%) rotateY(-90deg) rotateX(0deg) rotate(0deg); }
  50% { opacity: 1; transform: translateX(0) rotateY(0deg) rotateX(0deg) rotate(0deg); }
  100% { opacity: 1; transform: translateX(0) rotateY(0deg) rotateX(0deg) rotate(0deg); }
}
@keyframes fromBottomOutLeft {
  0%  { opacity: 0; transform: translateY(100%) rotateY(0deg) rotateX(-90deg) rotate(0deg); }
  50% { opacity: 1; transform: translateY(0) rotateY(0deg) rotateX(0deg) rotate(0deg); }
  100% { opacity: 1; transform: translateY(0) rotateY(0deg) rotateX(0deg) rotate(0deg); }
}
@keyframes fromRightOutTop {
  0%  { opacity: 0; transform: translateX(100%) rotateY(90deg) rotateX(0deg) rotate(0deg); }
  50% { opacity: 1; transform: translateX(0) rotateY(0deg) rotateX(0deg) rotate(0deg); }
  100% { opacity: 1; transform: translateX(0) rotateY(0deg) rotateX(0deg) rotate(0deg); }
}
.loader-cube {
  font-family: "sporty pro black", sans-serif;
  font-size: 60px;
  height: 60px;
  position: relative;
  width: 60px;
}
.loader-cube span {
  left: 50%;
  position: absolute;
  top: 53%;
  transform: translate(-50%, -50%);
}
.loader-char {
  height: 100%;
  line-height: 1;
  position: absolute;
  width: 100%;
}
.firstChar {
  animation-name: firstCharTransition;
  transform: translateX(100%) rotateY(90deg) rotateX(0deg) rotate(0deg);
  transform-origin: left bottom;
}
.fromBottomOutRight {
  animation-name: fromBottomOutRight;
  animation-fill-mode: forwards;
  transform: translateY(100%) rotateY(0deg) rotateX(-90deg) rotate(0deg);
  transform-origin: left top;
}
.fromLeftOutTop {
  animation-name: fromLeftOutTop;
  transform: translateX(-100%) rotateY(-90deg) rotateX(0deg) rotate(0deg);
  transform-origin: right bottom;
}
.fromBottomOutLeft {
  animation-name: fromBottomOutLeft;
  animation-fill-mode: forwards;
  transform: translateY(100%) rotateY(0deg) rotateX(-90deg) rotate(0deg);
  transform-origin: right top;
}
.fromRightOutTop {
  animation-name: fromRightOutTop;
  transform: translateX(100%) rotateY(90deg) rotateX(0deg) rotate(0deg);
  transform-origin: left bottom;
}
`;

const LETTER_ANIMS = [
  "firstCharTransition",
  "fromBottomOutRight",
  "fromLeftOutTop",
  "fromBottomOutLeft",
  "fromRightOutTop",
] as const;

const LETTER_CHARS = "I8STUDIOVN".split("");

function easeInOutExpo(x: number): number {
  if (x === 0) return 0;
  if (x === 1) return 1;
  if (x < 0.5) return Math.pow(2, 20 * x - 10) / 2;
  return (2 - Math.pow(2, -20 * x + 10)) / 2;
}

const LETTER_HOLD = 0.55;
const COUNTER_DURATION = LETTER_CHARS.length * LETTER_HOLD;
const VIDEO_IN_START = COUNTER_DURATION + 1;
const LAST_LETTER = LETTER_CHARS.length - 1;
const LETTER_CONFIGS: Array<{ char: string; anim: string; delay: number }> = LETTER_CHARS.map((char, index) => ({
  char,
  anim: LETTER_ANIMS[index % LETTER_ANIMS.length],
  delay: (COUNTER_DURATION / LETTER_CHARS.length) * index,
}));

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
  const [videoReady, setVideoReady] = useState(false);
  const [letterIndex, setLetterIndex] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const clipperAnimRef = useRef<number | null>(null);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const schedule = (callback: () => void, delay: number) => {
    const timer = setTimeout(callback, delay);
    timerRefs.current.push(timer);
    return timer;
  };

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      schedule(() => {
        if (!doneRef.current) {
          doneRef.current = true;
          onComplete();
        }
      }, 100);
      return;
    }

    const video = videoRef.current;
    if (!video || !video.currentSrc) {
      setVideoReady(true);
      return;
    }
    const handleCanPlay = () => setVideoReady(true);
    video.addEventListener("canplaythrough", handleCanPlay);
    video.play().catch(() => setVideoReady(true));
    return () => video.removeEventListener("canplaythrough", handleCanPlay);
  }, [onComplete]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !videoReady) return;

    function tick(now: number) {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const elapsed = (now - startTimeRef.current) / 1000;
      const prog = Math.min(elapsed / COUNTER_DURATION, 1);
      const curveProg = easeInOutExpo(prog);

      setLetterIndex(Math.min(LAST_LETTER, Math.floor((elapsed / COUNTER_DURATION) * LETTER_CHARS.length)));

      if (curveProg >= 0.99 && !doneRef.current) {
        doneRef.current = true;
        setLetterIndex(LAST_LETTER);
        setAnimOutContent(true);
        schedule(() => setPercentVal(100), 500);
        const remaining = Math.max((VIDEO_IN_START - elapsed) * 1000, 0);
        schedule(() => {
          setWrapperVisible(false);
          schedule(onComplete, 600);
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
  }, [onComplete, videoReady]);

  useEffect(() => {
    const timers = timerRefs.current;
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (clipperAnimRef.current !== null) cancelAnimationFrame(clipperAnimRef.current);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <>
      <style>{CSS_KEYFRAMES}</style>

      {/* Background video layer */}
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        loop
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100dvh",
          objectFit: "cover",
          zIndex: 999,
          opacity: wrapperVisible ? 1 : 0,
          transition: "opacity 0.6s ease",
          pointerEvents: "none",
        }}
      />

      <motion.svg
        aria-hidden="true"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
        style={{ position: "fixed", inset: 0, width: "100vw", height: "100dvh", zIndex: 1001, pointerEvents: "none", opacity: animOutContent ? 1 : 0 }}
      >
        <motion.path
          fill="#000"
          d="M0 1080V0H1920V1079.5C1920 1079.5 1917 1079.5 1024 1081C1 1080 0 1080 0 1080Z"
          animate={animOutContent ? {
            d: [
              "M0 1080V0H1920V1079.5C1920 1079.5 1917 1079.5 1024 1081C1 1080 0 1080 0 1080Z",
              "M0 582.5V0H1920V582.5C1920 582.5 1537.8 369 982.952 369C428.108 369 0 582.5 0 582.5Z",
              "M0 -6V0H1920.5V-8C1920.5 -8 1445 -12 977 -12C509 -12 0 -6 0 -6Z",
            ],
            transition: { duration: 1, delay: 1, times: [0, 0.5, 1], ease: "easeInOut" },
          } : undefined}
        />
      </motion.svg>

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
            {/* loader-cube container */}
            <div className="loader-cube">
              {(() => {
                const current = LETTER_CONFIGS[letterIndex];
                return (
                  <div
                    key={`${letterIndex}-${current.char}`}
                    className={`loader-char ${current.anim}`}
                    style={{
                      animationDuration: "1.4s",
                      animationDelay: "0s",
                      animationTimingFunction: "cubic-bezier(0.83, 0, 0.17, 1)",
                      animationFillMode: "both",
                    }}
                  >
                    <span>{current.char}</span>
                  </div>
                );
              })()}
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

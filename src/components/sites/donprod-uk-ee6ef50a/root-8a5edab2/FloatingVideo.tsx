"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { InlineVideo } from "./InlineVideo";

interface FloatingVideoProps {
  desktopThumb: string;
  desktopVideo?: string;
  isVisible: boolean;
  overlayMode?: boolean;
  targetRect?: DOMRect;
  onOverlayComplete?: () => void;
}

export function FloatingVideo({
  desktopThumb,
  desktopVideo,
  isVisible,
  overlayMode = false,
  targetRect,
  onOverlayComplete,
}: FloatingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [desktopVideo]);

  if (overlayMode && targetRect) {
    const viewportWidth = typeof window === "undefined" ? 1920 : window.innerWidth;
    const viewportHeight = typeof window === "undefined" ? 1080 : window.innerHeight;

    return (
      <motion.div
        initial={{ top: 0, left: 0, width: viewportWidth, height: viewportHeight }}
        animate={{
          top: targetRect.top,
          left: targetRect.left,
          width: targetRect.width,
          height: targetRect.height,
        }}
        transition={{ duration: 1.25, ease: [0.87, 0, 0.13, 1] }}
        onAnimationComplete={onOverlayComplete}
        style={{
          position: "fixed",
          overflow: "hidden",
          zIndex: 999,
          pointerEvents: "none",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={desktopThumb}
          alt=""
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        {desktopVideo ? (
          <InlineVideo
            autoPlay
            loop
            muted
            playsInline
            poster={desktopThumb}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          >
            <source src={desktopVideo} type="video/mp4" />
          </InlineVideo>
        ) : null}
      </motion.div>
    );
  }

  return (
    <div
      className="fl-home-wrapper"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      {desktopVideo && (
        <InlineVideo
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster={desktopThumb}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            // contain (not cover): show the full video frame, no top/bottom crop
            objectFit: "contain",
            filter: "brightness(0.6) grayscale(0.2)",
          }}
        >
          <source src={desktopVideo} type="video/mp4" />
        </InlineVideo>
      )}
      {/* fallback image shown behind video */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={desktopThumb}
        alt=""
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          // contain (not cover): show the full placeholder, no crop
          objectFit: "contain",
          filter: "brightness(0.6) grayscale(0.2)",
        }}
      />
    </div>
  );
}

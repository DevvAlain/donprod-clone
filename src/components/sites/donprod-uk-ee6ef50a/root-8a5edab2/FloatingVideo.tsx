"use client";

import { useRef, useEffect } from "react";

interface FloatingVideoProps {
  desktopThumb: string;
  desktopVideo?: string;
  isVisible: boolean;
}

export function FloatingVideo({ desktopThumb, desktopVideo }: FloatingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [desktopVideo]);

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
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.6) grayscale(0.2)",
          }}
        >
          <source src={desktopVideo} type="video/mp4" />
        </video>
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
          objectFit: "cover",
          filter: "brightness(0.6) grayscale(0.2)",
        }}
      />
    </div>
  );
}

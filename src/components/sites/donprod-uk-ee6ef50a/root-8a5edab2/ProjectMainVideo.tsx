"use client";

import { useState, useRef, useEffect } from "react";
import { DonprodProject } from "@/types/donprod";
import { BracketsWrapper } from "./BracketsWrapper";

function getVimeoId(url: string): string {
  return url.replace("https://vimeo.com/", "").split("/")[0];
}

interface Props {
  project: DonprodProject;
}

export function ProjectMainVideo({ project }: Props) {
  const [muted, setMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const vimeoId = getVimeoId(project.vimeo);
  const mediaBase = `https://www.donprod.uk/media/main/${project.slug}`;

  // Post message to Vimeo player for mute/unmute
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const value = muted ? 0 : 1;
    try {
      iframe.contentWindow?.postMessage(
        JSON.stringify({ method: "setVolume", value }),
        "https://player.vimeo.com"
      );
    } catch {
      // cross-origin, ignore
    }
  }, [muted]);

  // Lock body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const labelStyle: React.CSSProperties = {
    fontFamily: '"IBM Plex Mono", monospace',
    fontSize: "max(min(.7vw, 20px), 9px)",
    color: "#f6f6f6",
    letterSpacing: "0.08em",
    cursor: "pointer",
    userSelect: "none",
    overflow: "hidden",
    padding: "10px",
  };

  const wrapperStyle: React.CSSProperties = isFullscreen
    ? {
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 100,
        background: "#000",
        margin: 0,
      }
    : {
        position: "relative",
        width: "100%",
        height: "calc(56.25vw - 78.75px)",
        maxHeight: "calc(100dvh - 180px)",
      };

  return (
    <div className="main_video__wrapper" style={wrapperStyle}>
      <BracketsWrapper zIndex={4} offset={0} />

      {/* Thumbnail + video content */}
      <div
        className="main_video__content"
        style={{
          cursor: "pointer",
          overflow: "hidden",
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        {/* Thumbnail */}
        <div
          className="proj_thumbnail__wrapper"
          style={{ position: "absolute", inset: 0, zIndex: 1 }}
        >
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backgroundImage: `url(${project.thumbPlaceholder})`,
              backgroundSize: "cover",
              backgroundPosition: "center center",
              backgroundRepeat: "no-repeat",
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${mediaBase}/thumbnails/desktop.webp`}
            alt={project.title}
            style={{
              position: "absolute",
              width: "100%",
              height: "auto",
              opacity: 1,
            }}
          />
        </div>

        {/* Vimeo iframe */}
        <div
          className="project-video"
          style={{ position: "absolute", inset: 0, zIndex: 2 }}
        >
          <iframe
            ref={iframeRef}
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&muted=1&controls=0&dnt=1&pip=0&speed=0`}
            style={{ width: "100%", height: "100%", border: "none" }}
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
            referrerPolicy="strict-origin-when-cross-origin"
            title={`${project.title} - ${project.artist ?? ""}`}
          />
        </div>
      </div>

      {/* FULLSCREEN label — LEFT side, rotated 270deg */}
      {!isFullscreen && (
        <div
          className="fullscreen_wrapper"
          style={{
            ...labelStyle,
            position: "absolute",
            top: "50%",
            left: -35,
            transform: "translate(-50%, -50%) rotate(270deg)",
            transformOrigin: "center",
            zIndex: 5,
          }}
          onClick={() => setIsFullscreen(true)}
        >
          FULLSCREEN
        </div>
      )}

      {/* SOUND label — RIGHT side, rotated 90deg */}
      {!isFullscreen && (
        <div
          className="muted_wrapper"
          style={{
            ...labelStyle,
            position: "absolute",
            top: "50%",
            right: -35,
            transform: "translate(50%, -50%) rotate(90deg)",
            transformOrigin: "center",
            zIndex: 5,
          }}
          onClick={() => setMuted((m) => !m)}
        >
          <span style={{ position: "relative", display: "inline-block" }}>
            SOUND
            {!muted && (
              <span
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: "#f6f6f6",
                  transform: "translateX(-50%) rotate(45deg)",
                  pointerEvents: "none",
                }}
              />
            )}
          </span>
        </div>
      )}

      {/* Exit fullscreen on click when fullscreen */}
      {isFullscreen && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 6,
            cursor: "pointer",
          }}
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </div>
  );
}

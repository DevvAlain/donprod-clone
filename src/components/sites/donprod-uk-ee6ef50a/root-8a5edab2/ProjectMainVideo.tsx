"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DonprodProject } from "@/types/donprod";
import { BracketsWrapper } from "./BracketsWrapper";
import { getYouTubeEmbedUrl, getVimeoEmbedUrl } from "@/lib/youtube";

interface Props {
  project: DonprodProject;
}

const TIMER_COUNT = 150;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ProjectMainVideo({ project }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const vimeoRef = useRef<HTMLIFrameElement>(null);
  const frameRef = useRef<number | null>(null);
  const restoreOverflowRef = useRef("");
  const [muted, setMuted] = useState(true);
  const [cursorPoint, setCursorPoint] = useState({ x: 0, y: 0 });
  const [cursorVisible, setCursorVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [thumbnailReady, setThumbnailReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const youTubeEmbedUrl = project.videoType === "YOUTUBE" && project.videoUrl
    ? getYouTubeEmbedUrl(project.videoUrl)
    : null;
  const vimeoEmbedUrl = project.videoType === "VIMEO" && project.videoUrl
    ? getVimeoEmbedUrl(project.videoUrl)
    : null;
  const isNativeVideo = project.videoType === "CLOUDINARY" && Boolean(project.videoUrl);
  const isInteractiveVideo = isNativeVideo || Boolean(vimeoEmbedUrl);

  const stopFrame = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const updateProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setProgress(video.duration ? video.currentTime / video.duration : 0);
    if (!video.paused && !video.ended) frameRef.current = requestAnimationFrame(updateProgress);
  }, []);

  const startProgress = useCallback(() => {
    stopFrame();
    frameRef.current = requestAnimationFrame(updateProgress);
  }, [stopFrame, updateProgress]);

  const sendVimeo = useCallback((method: string, value?: unknown) => {
    vimeoRef.current?.contentWindow?.postMessage(
      JSON.stringify({ method, ...(value === undefined ? {} : { value }) }),
      "https://player.vimeo.com",
    );
  }, []);

  const togglePlayback = useCallback(() => {
    if (isNativeVideo) {
      const video = videoRef.current;
      if (!video) return;
      if (muted) {
        video.muted = false;
        video.volume = 1;
        setMuted(false);
        if (video.paused || video.ended) video.play().catch(() => undefined);
        return;
      }
      if (video.paused || video.ended) video.play().catch(() => undefined);
      else video.pause();
      return;
    }

    if (vimeoEmbedUrl) {
      if (muted) {
        setIsWaiting(!isPlaying);
        setMuted(false);
        sendVimeo("setVolume", 1);
        if (!isPlaying) sendVimeo("play");
        return;
      }
      if (isPlaying) sendVimeo("pause");
      else {
        setIsWaiting(true);
        sendVimeo("play");
      }
    }
  }, [isNativeVideo, vimeoEmbedUrl, isPlaying, muted, sendVimeo]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((value) => !value);
  }, []);

  useEffect(() => {
    if (!vimeoEmbedUrl) return;

    const frame = vimeoRef.current;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://player.vimeo.com" || event.source !== frame?.contentWindow) return;
      let data: { event?: string; data?: { duration?: number; seconds?: number } };
      try {
        data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      if (data.event === "ready") {
        frame?.contentWindow?.postMessage(JSON.stringify({ method: "addEventListener", value: "play" }), "https://player.vimeo.com");
        frame?.contentWindow?.postMessage(JSON.stringify({ method: "addEventListener", value: "pause" }), "https://player.vimeo.com");
        frame?.contentWindow?.postMessage(JSON.stringify({ method: "addEventListener", value: "playing" }), "https://player.vimeo.com");
        frame?.contentWindow?.postMessage(JSON.stringify({ method: "addEventListener", value: "waiting" }), "https://player.vimeo.com");
        frame?.contentWindow?.postMessage(JSON.stringify({ method: "addEventListener", value: "ended" }), "https://player.vimeo.com");
        frame?.contentWindow?.postMessage(JSON.stringify({ method: "addEventListener", value: "timeupdate" }), "https://player.vimeo.com");
      }
      if (data.event === "play" || data.event === "playing") {
        setIsPlaying(true);
        setIsWaiting(false);
      }
      if (data.event === "pause" || data.event === "ended") {
        setIsPlaying(false);
        setIsWaiting(false);
        if (data.event === "ended") setProgress(1);
      }
      if (data.event === "waiting") setIsWaiting(true);
      if (data.event === "timeupdate" && data.data) {
        if (data.data.duration) setDuration(data.data.duration);
        if (data.data.seconds && data.data.duration) setProgress(data.data.seconds / data.data.duration);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [vimeoEmbedUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => setDuration(video.duration || 0);
    const onLoadedData = () => setThumbnailReady(true);
    const onPlay = () => {
      setIsPlaying(true);
      setIsWaiting(false);
      startProgress();
      if (!prefersReducedMotion()) {
        const wrapper = document.querySelector<HTMLElement>(".project_page__wrapper");
        wrapper?.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    const onPause = () => {
      setIsPlaying(false);
      stopFrame();
    };
    const onWaiting = () => setIsWaiting(true);
    const onPlaying = () => {
      setIsWaiting(false);
      startProgress();
    };
    const onEnded = () => {
      setIsPlaying(false);
      setProgress(1);
      stopFrame();
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("ended", onEnded);
      stopFrame();
    };
  }, [startProgress, stopFrame]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = muted;
    if (vimeoEmbedUrl) sendVimeo("setVolume", muted ? 0 : 1);
  }, [muted, vimeoEmbedUrl, sendVimeo]);

  useEffect(() => {
    if (!isFullscreen) {
      document.body.style.overflow = restoreOverflowRef.current;
      return;
    }
    restoreOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = restoreOverflowRef.current;
    };
  }, [isFullscreen]);

  useEffect(() => () => {
    document.body.style.overflow = restoreOverflowRef.current;
    stopFrame();
  }, [stopFrame]);

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

  const wrapperStyle: React.CSSProperties = {
    position: isFullscreen ? "fixed" : "relative",
    inset: isFullscreen ? 0 : undefined,
    width: isFullscreen ? "100vw" : "100%",
    height: isFullscreen ? "100vh" : "calc(56.25vw - 78.75px)",
    maxHeight: isFullscreen ? "100vh" : "calc(100dvh - 180px)",
    zIndex: isFullscreen ? 100 : undefined,
    background: "#000",
    margin: 0,
    transition: prefersReducedMotion() ? "none" : "transform 1.25s cubic-bezier(.87,0,.13,1)",
    transform: isFullscreen ? "translate(0, calc(50dvh - 60px - 50%)) scale(1)" : "translate(0, 0) scale(1)",
  };

  return (
    <div className="main_video__wrapper" style={wrapperStyle}>
      <style>{`@keyframes project-loader-up{0%{transform:translateY(0)}100%{transform:translateY(-85.7%)}}`}</style>
      <BracketsWrapper zIndex={4} offset={0} />
      <div
        className="main_video__content"
        role={isInteractiveVideo ? "button" : undefined}
        tabIndex={isInteractiveVideo ? 0 : undefined}
        aria-label={isInteractiveVideo ? (isPlaying ? "Pause project video" : "Play project video") : undefined}
        style={{ cursor: isInteractiveVideo ? "pointer" : "default", overflow: "hidden", position: "relative", width: "100%", height: "100%" }}
        onClick={isInteractiveVideo ? togglePlayback : undefined}
        onMouseMove={isInteractiveVideo ? (e) => { const r = e.currentTarget.getBoundingClientRect(); setCursorPoint({ x: e.clientX - r.left, y: e.clientY - r.top }); setCursorVisible(true); } : undefined}
        onMouseLeave={isInteractiveVideo ? () => setCursorVisible(false) : undefined}
        onKeyDown={isInteractiveVideo ? (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            togglePlayback();
          }
        } : undefined}
      >
        <div className="proj_thumbnail__wrapper" style={{ position: "absolute", inset: 0, zIndex: 1, opacity: thumbnailReady && isPlaying ? 0 : 1, transition: "opacity .65s ease", filter: isWaiting ? "grayscale(1) contrast(2)" : "grayscale(0) contrast(1)" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${project.thumbPlaceholder})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(5px)" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={project.thumbDesktop} alt={project.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        <div className="project-video" style={{ position: "absolute", inset: 0, zIndex: 2 }}>
          {youTubeEmbedUrl && (
            <iframe
              src={`${youTubeEmbedUrl}&mute=${muted ? 1 : 0}&autoplay=1`}
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              referrerPolicy="strict-origin-when-cross-origin"
              title={`${project.title} - ${project.artist ?? ""}`}
            />
          )}
          {vimeoEmbedUrl && (
            <iframe
              ref={vimeoRef}
              src={`${vimeoEmbedUrl}&muted=${muted ? 1 : 0}`}
              style={{ width: "100%", height: "100%", border: "none", pointerEvents: "none" }}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              referrerPolicy="strict-origin-when-cross-origin"
              title={`${project.title} - ${project.artist ?? ""}`}
            />
          )}
          {isNativeVideo && (
            <video
              ref={videoRef}
              src={project.videoUrl ?? undefined}
              autoPlay
              muted={muted}
              playsInline
              loop
              preload="metadata"
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: isWaiting ? "grayscale(1) contrast(.8)" : "none", transition: "filter .35s ease" }}
            />
          )}
        </div>

        {isInteractiveVideo && isMobile && !isPlaying && !isWaiting && !isFullscreen && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 5,
              pointerEvents: "none",
              fontFamily: '"Heading Now", sans-serif',
              fontStretch: "condensed",
              fontWeight: 600,
              fontSize: "min(6vw, 33px)",
              color: "#f6f6f6",
            }}
          >
            PLAY
          </div>
        )}
        {isInteractiveVideo && !isMobile && cursorVisible && !isWaiting && (
          <div
            aria-hidden="true"
            style={{ position: "absolute", left: cursorPoint.x, top: cursorPoint.y, zIndex: 5, transform: "translate(-50%, -50%)", pointerEvents: "none", font: '10px "IBM Plex Mono", monospace', letterSpacing: ".1em", color: "#f6f6f6" }}
          >
            {isPlaying ? "PAUSE" : "PLAY"}
          </div>
        )}
        {isWaiting && (
          <div aria-label="Loading video" style={{ position: "absolute", inset: 0, zIndex: 5, display: "grid", placeItems: "center", pointerEvents: "none", mixBlendMode: "difference" }}>
            <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: '"Heading Now", sans-serif', fontSize: "min(10vw, 125px)", fontWeight: 700, lineHeight: .8, transform: "scaleY(1.5)", filter: "grayscale(1) invert(1) contrast(2)" }}>
              <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", filter: "blur(.5px)" }}>LOADING</span>
              <div style={{ display: "flex", position: "relative" }}>
                {"LOADING".split("").map((char, index) => (
                  <span key={`${char}-${index}`} style={{ position: "relative", display: "block", overflow: "hidden", filter: "blur(2px)" }}>
                    <span style={{ opacity: 0 }}>{char}</span>
                    <span style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", animation: `project-loader-up ${10 + index * 3}s cubic-bezier(.87,0,.13,1) infinite` }}>{Array.from({ length: 7 }, (_, i) => <span key={i}>{char}</span>)}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {!isFullscreen && (
        <button type="button" className="fullscreen_wrapper" aria-label="Open fullscreen" style={{ ...labelStyle, position: "absolute", top: "50%", left: -35, transform: "translate(-50%, -50%) rotate(270deg)", transformOrigin: "center", zIndex: 5, background: "none", border: 0 }} onClick={toggleFullscreen}>
          FULLSCREEN
        </button>
      )}
      {!isFullscreen && (
        <button type="button" className="muted_wrapper" aria-label={muted ? "Turn sound on" : "Mute sound"} style={{ ...labelStyle, position: "absolute", top: "50%", right: -35, transform: "translate(50%, -50%) rotate(90deg)", transformOrigin: "center", zIndex: 5, background: "none", border: 0 }} onClick={() => setMuted((value) => !value)}>
          <span style={{ position: "relative", display: "inline-block" }}>
            SOUND
            {!muted && <span style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "#f6f6f6", transform: "translateX(-50%) rotate(45deg)", pointerEvents: "none" }} />}
          </span>
        </button>
      )}
      {isFullscreen && <button type="button" aria-label="Close fullscreen" style={{ ...labelStyle, position: "absolute", top: 20, right: 20, zIndex: 7, background: "none", border: 0 }} onClick={toggleFullscreen}>CLOSE</button>}

      {(isNativeVideo || vimeoEmbedUrl) && (
        <div className="timer__wrapper" aria-label={`Video progress ${Math.round(progress * 100)} percent`} style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", width: "100%", height: 20, marginBottom: 20, transformOrigin: "bottom", opacity: duration || vimeoEmbedUrl ? 1 : 0.35, transition: "opacity .4s ease" }}>
          {Array.from({ length: TIMER_COUNT }, (_, index) => {
            const active = index / TIMER_COUNT <= progress;
            return <span key={index} className="timer-line" style={{ width: 1, height: "100%", background: active ? "#f6f6f6" : "var(--grid-lines, #383838)", transform: "scaleY(0.65)", transformOrigin: "bottom", transition: "transform 2s ease-in-out, background 2s ease-in-out" }} />;
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface ProjectTileProps {
  project: {
    slug: string;
    title: string;
    artist: string | null;
    thumbMobile: string;
    thumbPlaceholder: string;
    mobileVideo: string;
  };
  isActive: boolean;
  isMobile?: boolean;
  index: number;
  onActivate?: () => void;
  onTileClick?: () => void;
  isHoveredByOther?: boolean;
  isHoveredSelf?: boolean;
  onTileMouseEnter?: () => void;
  onTileMouseLeave?: () => void;
}

function BracketCorner({ position }: {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const isTop = position.startsWith("top");
  const isLeft = position.endsWith("left");

  return (
    <div
      style={{
        position: "absolute",
        top: isTop ? 4 : undefined,
        bottom: isTop ? undefined : 4,
        left: isLeft ? 4 : undefined,
        right: isLeft ? undefined : 4,
        width: 5,
        height: 5,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: isTop ? 0 : undefined,
          bottom: isTop ? undefined : 0,
          left: isLeft ? 0 : undefined,
          right: isLeft ? undefined : 0,
          width: 5,
          height: 1,
          background: "white",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: isTop ? 0 : undefined,
          bottom: isTop ? undefined : 0,
          left: isLeft ? 0 : undefined,
          right: isLeft ? undefined : 0,
          width: 1,
          height: 5,
          background: "white",
        }}
      />
    </div>
  );
}

export function ProjectTile({ project, isActive, isMobile = false, index: _index, onActivate, onTileClick, isHoveredByOther = false, isHoveredSelf = false, onTileMouseEnter, onTileMouseLeave }: ProjectTileProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onActivate?.();
    if (onTileClick) {
      onTileClick();
    } else {
      router.push(`/project/${project.slug.toLowerCase()}`);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive || isHovered) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isActive, isHovered]);

  // Hover logic:
  // - isTemporarilyHidden: this is the active tile but another tile is being hovered
  // - shouldBeExpanded: expanded when active (and no other tile hovered) OR when this tile is hovered
  const isTemporarilyHidden = isActive && isHoveredByOther;
  const shouldBeExpanded = (isActive && !isHoveredByOther) || isHoveredSelf;

  const tileTransform = isMobile
    ? "none"
    : shouldBeExpanded
    ? "scaleX(1.18421)"
    : "matrix(1, 3.49066e-05, -3.49066e-05, 1, 0, 0)";

  const tileOpacity = isMobile ? 1 : shouldBeExpanded ? 1 : isTemporarilyHidden ? 0.2 : isActive ? 1 : 0.2;

  if (isMobile) {
    return (
      <div
        className="hpt__wrapper"
        style={{ width: "100%", height: "20dvh", position: "relative", overflow: "hidden", cursor: "pointer", flexShrink: 0 }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.thumbMobile}
          alt={project.title}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
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
            opacity: isActive ? 1 : isHovered ? 0.7 : 0,
            transition: "opacity 0.3s",
          }}
        >
          <source src={project.mobileVideo} type="video/mp4" />
        </video>
      </div>
    );
  }

  return (
    <div
      className="hpt__wrapper"
      style={{
        display: "block",
        width: "100%",
        height: isMobile ? "auto" : "20dvh",
        padding: isMobile ? 0 : 10,
        position: "relative",
        flexShrink: 0,
        cursor: "pointer",
        boxSizing: "border-box",
      }}
      onClick={handleClick}
      onMouseEnter={() => {
        setIsHovered(true);
        onTileMouseEnter?.();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onTileMouseLeave?.();
      }}
    >
      <div
        className={`home_project_tile${isActive && !isHoveredByOther ? " snapped is-active" : ""}`}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          position: "relative",
          transition: "transform 1s cubic-bezier(0.25, 1, 0.5, 1), opacity 1s cubic-bezier(0.25, 1, 0.5, 1)",
          transform: tileTransform,
          opacity: tileOpacity,
        }}
      >
        <div
          className="scaler_counter__wrapper"
          style={{ width: "100%", height: "100%", position: "relative" }}
        >
          <div
            className="hpt_ovflw__wrapper"
            style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}
          >
            <div
              className="tile_content"
              style={{ transform: "translate3d(0,0,0)", width: "100%", height: "100%" }}
            >
              <div
                className="hpt_counter_scaler"
                style={{
                  width: "100%",
                  height: "100%",
                  position: "relative",
                  transform: shouldBeExpanded ? "scaleY(1.18421)" : "scaleY(1)",
                  transition: "transform 1s cubic-bezier(0.25, 1, 0.5, 1)",
                }}
              >
                <div className="h-img-wrapper" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
                  <div
                    className="grid-item__thumb"
                    style={{
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      className="refme"
                      style={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "100%",
                          backgroundImage: `url(${project.thumbPlaceholder})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          backgroundRepeat: "no-repeat",
                          transition: "filter 0.5s linear, transform 0.5s linear",
                        }}
                      />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        className="full-thumb"
                        src={project.thumbMobile}
                        alt={project.title}
                        style={{
                          position: "absolute",
                          width: "100%",
                          height: "auto",
                          opacity: 1,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <video
                  ref={videoRef}
                  className="grid-item__hover"
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: "100%",
                    objectFit: "cover",
                    opacity: shouldBeExpanded ? 1 : isHovered ? 0.7 : 0,
                    transition: "opacity 0.3s",
                  }}
                >
                  <source src={project.mobileVideo} type="video/mp4" />
                </video>
              </div>
            </div>

            <div
              className="hover-icon"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                opacity: shouldBeExpanded ? 1 : 0,
                transition: "opacity 0.3s",
                pointerEvents: "none",
              }}
            >
              <div className="line_wrapper" style={{ position: "relative", width: 16, height: 16 }}>
                <div className="upper" style={{ width: 1, height: 8, background: "white", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -100%)" }} />
                <div className="bottom" style={{ width: 1, height: 8, background: "white", position: "absolute", top: "50%", left: "50%", transform: "translateX(-50%)" }} />
                <div className="left" style={{ height: 1, width: 8, background: "white", position: "absolute", top: "50%", left: "50%", transform: "translate(-100%, -50%)" }} />
                <div className="right" style={{ height: 1, width: 8, background: "white", position: "absolute", top: "50%", left: "50%", transform: "translateY(-50%)" }} />
              </div>
            </div>
          </div>

          {shouldBeExpanded && (
            <div
              className="bc_wrapper"
              style={{
                position: "absolute",
                top: -20,
                left: -20,
                right: -20,
                bottom: -20,
                pointerEvents: "none",
              }}
            >
              <BracketCorner position="top-left" />
              <BracketCorner position="top-right" />
              <BracketCorner position="bottom-left" />
              <BracketCorner position="bottom-right" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

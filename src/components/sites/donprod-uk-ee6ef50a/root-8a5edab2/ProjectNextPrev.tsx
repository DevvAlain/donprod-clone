"use client";

import Link from "next/link";
import { DonprodProject } from "@/types/donprod";
import { BracketsWrapper } from "./BracketsWrapper";
import { useRouteTransition } from "./RouteTransition";

interface Props {
  prevProject?: DonprodProject;
  nextProject?: DonprodProject;
}

function TileMedia({ project }: { project: DonprodProject }) {
  const videoSrc = project.gifStyling.mobileVideo || project.mobileVideo;

  return videoSrc ? (
    <video
      autoPlay
      loop
      muted
      playsInline
      poster={project.thumbDesktop}
      aria-label={project.title}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    >
      <source src={videoSrc} type="video/mp4" />
    </video>
  ) : (
    <div
      aria-label={project.title}
      style={{ width: "100%", height: "100%", background: `center / cover url(${project.thumbDesktop})` }}
    />
  );
}

function NavTile({
  project,
  label,
  side,
  onNavigate,
}: {
  project: DonprodProject;
  label: string;
  side: "prev" | "next";
  onNavigate: (project: DonprodProject) => void;
}) {
  return (
    <Link
      href={`/project/${project.slug.toLowerCase()}`}
      scroll={false}
      className={`${side}_tile np_half__wrapper ms-half`}
      aria-label={`${label} project: ${project.title}`}
      onClick={() => onNavigate(project)}
      style={{
        position: "absolute",
        top: 0,
        left: side === "prev" ? 0 : undefined,
        right: side === "next" ? 0 : undefined,
        display: "flex",
        flexDirection: "row",
        width: "45%",
        height: "100%",
        overflow: "hidden",
        padding: 0,
        border: 0,
        background: "transparent",
        cursor: "pointer",
        color: "inherit",
        textDecoration: "none",
      }}
    >
      <div className="tile_left" style={{ width: "50%", height: "100%", overflow: "hidden" }}>
        <TileMedia project={project} />
      </div>
      <div className="tile_right" style={{ width: "50%", height: "100%", overflow: "hidden" }}>
        <TileMedia project={project} />
      </div>
    </Link>
  );
}

function NavTitle({ label, side }: { label: string; side: "prev" | "next" }) {
  return (
    <div
      className={`np_meta__wrapper ${side}_title`}
      style={{
        position: "absolute",
        top: "50%",
        left: side === "prev" ? "22.5%" : "77.5%",
        zIndex: 3,
        transform: "translate(-50%, -50%)",
        fontFamily: '"Sporty Pro Black", sans-serif',
        fontSize: "clamp(48px, 7vw, 96px)",
        lineHeight: 0.85,
        color: "#f6f6f6",
        mixBlendMode: "difference",
        pointerEvents: "none",
        textTransform: "uppercase",
      }}
    >
      <div className="np_title__wrapper" style={{ margin: 15, whiteSpace: "nowrap" }}>
        {label.split("").map((character, index) => (
          <span key={`${character}-${index}`} style={{ display: "inline-block" }}>{character}</span>
        ))}
      </div>
    </div>
  );
}

export function ProjectNextPrev({ prevProject, nextProject }: Props) {
  const { openProject } = useRouteTransition();

  if (!prevProject || !nextProject) return null;

  const goTo = (project: DonprodProject) => {
    const thumbSrc = project.thumbDesktop || project.thumbMobile || "";
    openProject({
      href: `/project/${project.slug.toLowerCase()}`,
      thumbSrc,
      placeholderSrc: project.thumbPlaceholder || thumbSrc,
    });
  };

  return (
    <>
      <div
        className="project_next__wrapper"
        style={{
          position: "relative",
          width: "100%",
          height: "calc(56.25vw - 78.75px)",
          maxHeight: "calc(100dvh - 180px)",
          opacity: 1,
        }}
      >
        <div
          className="np_section__wrapper"
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translate3d(-50%, 0, 0)",
            width: "100%",
            height: "100%",
          }}
        >
          <BracketsWrapper zIndex={6} />
          <div className="np_tiles__wrapper" style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
            <NavTile project={prevProject} label="PREV" side="prev" onNavigate={goTo} />
            <div className="np_diver_wrapper" style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "10%", height: "100%", zIndex: 4 }}>
              <div className="np_diver" style={{ width: "100%", height: "100%", background: "var(--dark-color, #000)" }} />
            </div>
            <NavTile project={nextProject} label="NEXT" side="next" onNavigate={goTo} />
            <NavTitle label="PREV" side="prev" />
            <NavTitle label="NEXT" side="next" />
            <div className="np_gl__wrapper" aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}>
              <div className="np_gl__upper" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 1, background: "var(--grid-lines, #383838)" }} />
              <div className="np_gl__lower" style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 1, background: "var(--grid-lines, #383838)" }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

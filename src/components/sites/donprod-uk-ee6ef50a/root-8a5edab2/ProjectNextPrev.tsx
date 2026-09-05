"use client";

import { useRouter } from "next/navigation";
import { DonprodProject } from "@/types/donprod";
import { BracketsWrapper } from "./BracketsWrapper";

interface Props {
  prevProject: DonprodProject;
  nextProject: DonprodProject;
}

function NavTile({
  project,
  label,
}: {
  project: DonprodProject;
  label: string;
}) {
  const router = useRouter();
  const mediaBase = `https://www.donprod.uk/media/main/${project.slug}`;
  const videoSrc = `${mediaBase}/trim.mp4`;

  return (
    <div
      style={{ flex: "0 0 50%", position: "relative", cursor: "pointer" }}
      onClick={() => router.push(`/project/${project.slug.toLowerCase()}`)}
    >
      {/* Label */}
      <div
        className="np_meta__wrapper"
        style={{
          fontFamily: '"Sporty Pro Black", sans-serif',
          fontSize: "clamp(20px, 3vw, 48px)",
          color: "#f6f6f6",
          letterSpacing: "0.05em",
          padding: "8px 12px",
        }}
      >
        <div className="np_title__wrapper">
          {label.split("").map((char, i) => (
            <span key={i} style={{ display: "inline-block", zIndex: 1 }}>
              {char}
            </span>
          ))}
        </div>
      </div>

      {/* Half-tile videos */}
      <div
        className="np_half__wrapper"
        style={{
          display: "flex",
          width: "100%",
          aspectRatio: "2 / 1",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          className="tile_left"
          style={{ flex: "0 0 50%", overflow: "hidden" }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          >
            <source src={videoSrc} />
          </video>
        </div>
        <div
          className="tile_right"
          style={{ flex: "0 0 50%", overflow: "hidden" }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          >
            <source src={videoSrc} />
          </video>
        </div>
      </div>
    </div>
  );
}

export function ProjectNextPrev({ prevProject, nextProject }: Props) {
  return (
    <div
      className="project_next__wrapper"
      style={{ opacity: 1, marginTop: 80, padding: "0 max(20px, 5vw)" }}
    >
      <div
        className="np_section__wrapper"
        style={{ position: "relative", width: "100%" }}
      >
        <BracketsWrapper zIndex={6} />

        <div
          className="np_tiles__wrapper"
          style={{ display: "flex", flexDirection: "row" }}
        >
          <NavTile project={prevProject} label="PREV" />

          {/* Divider */}
          <div
            className="np_diver_wrapper"
            style={{
              display: "flex",
              alignItems: "stretch",
              flexShrink: 0,
            }}
          >
            <div
              className="np_diver"
              style={{
                width: 1,
                background: "#2a2a2a",
                alignSelf: "stretch",
              }}
            />
          </div>

          <NavTile project={nextProject} label="next" />
        </div>
      </div>
    </div>
  );
}

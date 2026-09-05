import { DonprodProject } from "@/types/donprod";
import { Navbar } from "./Navbar";
import { ProjectMainVideo } from "./ProjectMainVideo";
import { ProjectMeta } from "./ProjectMeta";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectNextPrev } from "./ProjectNextPrev";

interface Props {
  project: DonprodProject;
  prevProject: DonprodProject;
  nextProject: DonprodProject;
}

export function ProjectDetailPage({ project, prevProject, nextProject }: Props) {
  return (
    <div
      className="donprod-page project_page__wrapper"
      style={{
        fontFamily: "var(--font-punchy)",
        background: "#000",
        color: "#f6f6f6",
        position: "relative",
        height: "100dvh",
        width: "100vw",
        overflowY: "scroll",
        overflowX: "hidden",
      }}
    >
      {/* Fixed grid lines */}
      <div
        className="proj-grid-lines p-left-line"
        style={{
          position: "fixed",
          top: 0,
          height: "100%",
          left: 49,
          width: 1,
          background: "#2a2a2a",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        className="proj-grid-lines p-right-line"
        style={{
          position: "fixed",
          top: 0,
          height: "100%",
          right: 49,
          width: 1,
          background: "#2a2a2a",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        className="proj-grid-lines p-top-line"
        style={{
          position: "absolute",
          top: 59,
          left: 0,
          width: "100vw",
          height: 1,
          background: "#2a2a2a",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        className="proj-grid-lines p-bottom-line"
        style={{
          position: "fixed",
          top: "min(calc(100dvh - 120px), calc(-18.75px + 56.25vw))",
          left: 0,
          width: "100vw",
          height: 1,
          background: "#2a2a2a",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <Navbar />

      <div
        className="proj-scroll__wrapper"
        style={{ width: "100%" }}
      >
        <div className="project-scroller">
          <div
            className="main_content_wrapper"
            style={{
              fontSize: 12,
              fontWeight: 500,
              padding: "60px 70px 120px",
            }}
          >
            <ProjectMainVideo project={project} />
            <ProjectMeta project={project} />
            <ProjectGallery project={project} />
            <ProjectNextPrev prevProject={prevProject} nextProject={nextProject} />
          </div>
        </div>
      </div>
    </div>
  );
}

import { DonprodProject } from "@/types/donprod";
import { Navbar } from "./Navbar";
import { ProjectMainVideo } from "./ProjectMainVideo";
import { ProjectMeta } from "./ProjectMeta";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectNextPrev } from "./ProjectNextPrev";
import { ProjectViewTracker } from "./ProjectViewTracker";

interface Props {
  project: DonprodProject;
  prevProject?: DonprodProject;
  nextProject?: DonprodProject;
  preview?: boolean;
}

export function ProjectDetailPage({ project, prevProject, nextProject, preview = false }: Props) {
  return (
    <>
      {!preview && project.slug ? <ProjectViewTracker slug={project.slug} /> : null}
    <div
      className="donprod-page project_page__wrapper"
      style={{
        fontFamily: "var(--font-punchy)",
        background: "#000",
        color: "#f6f6f6",
        position: "relative",
        height: preview ? "100%" : "100dvh",
        width: preview ? "100%" : "100vw",
        overflowY: "scroll",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @media (max-width: 767px) {
          .project_page__wrapper .main_content_wrapper { padding: 60px 20px 80px !important; }
          .project_page__wrapper .p-left-line { left: 20px !important; }
          .project_page__wrapper .p-right-line { right: 20px !important; }
          .project_page__wrapper .p-bottom-line { display: none; }
          .project_page__wrapper .main_video__wrapper { height: calc((100vw - 40px) * .5625) !important; max-height: none !important; }
          .project_page__wrapper .fullscreen_wrapper,
          .project_page__wrapper .muted_wrapper { display: none !important; }
          .project_page__wrapper .video_aux__wrapper { padding: 10px 0 0 !important; min-height: 0 !important; }
          .project_page__wrapper .extra__wrapper { padding: 5px 7px 0 !important; }
          .project_page__wrapper .main_meta__wrapper { flex-direction: row !important; align-items: flex-end !important; gap: 8px; margin-top: 10px !important; }
          .project_page__wrapper .meta_first_col,
          .project_page__wrapper .meta_third_col {
            font-family: "Heading Now", sans-serif !important;
            font-size: 10vw !important;
            font-stretch: extra-condensed !important;
            font-weight: 700 !important;
            line-height: .8 !important;
          }
          .project_page__wrapper .meta_second_col { display: none; }
          .project_page__wrapper .meta_third_col {
            text-align: right !important;
            -webkit-text-stroke-width: 1px;
            -webkit-text-stroke-color: #f6f6f6;
            color: transparent !important;
          }
          .project_page__wrapper .meta_third_col * { color: inherit !important; -webkit-text-stroke: inherit; }
          .project_page__wrapper .secondary_meta__wrapper { flex-direction: column !important; gap: 24px !important; padding-top: 24px !important; }
          .project_page__wrapper .sm_left,
          .project_page__wrapper .sm_right { width: 100% !important; padding-bottom: 24px !important; }
          .project_page__wrapper .sm_right { padding-top: 0 !important; }
          .project_page__wrapper .credit__wrapper { flex-direction: column !important; }
          .project_page__wrapper .m_title { padding-right: 0 !important; margin-bottom: 16px; }
          .project_page__wrapper .project_gallery__wrapper { padding: 0 0 100px !important; }
          .project_page__wrapper .proj-row__wrapper,
          .project_page__wrapper .project_gallery_grid__wrapper > .proj_grid__row { flex-direction: column !important; }
          .project_page__wrapper .c-img__wrapper,
          .project_page__wrapper .proj_grid_still__wrapper { width: 100% !important; }
          .project_page__wrapper .project_next__wrapper {
            height: calc(56.25vw - 56.25px) !important;
            max-height: none !important;
          }
          .project_page__wrapper .np_tiles__wrapper {
            display: flex !important;
            flex-direction: column !important;
          }
          .project_page__wrapper .prev_tile,
          .project_page__wrapper .next_tile {
            position: relative !important;
            top: auto !important;
            left: auto !important;
            right: auto !important;
            width: 100% !important;
            height: auto !important;
            flex: 1 1 50%;
          }
          .project_page__wrapper .np_diver_wrapper {
            position: relative !important;
            top: auto !important;
            left: auto !important;
            transform: none !important;
            width: 100% !important;
            height: 1px !important;
            flex: 0 0 1px;
          }
          .project_page__wrapper .np_diver { height: 1px !important; width: 100% !important; }
          .project_page__wrapper .prev_title { top: 25% !important; left: 50% !important; }
          .project_page__wrapper .next_title { top: 75% !important; left: 50% !important; }
        }
        .project_page__wrapper {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .project_page__wrapper::-webkit-scrollbar {
          display: none;
        }
      `}</style>
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
    </>
  );
}

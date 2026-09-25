"use client";

import { useEffect, useRef, useState } from "react";
import { DonprodProject } from "@/types/donprod";

interface Props {
  project: DonprodProject;
}

const EASE = "cubic-bezier(.16,1,.3,1)";

function RevealText({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  return (
    <span className={className} style={{ display: "inline-block", overflow: "hidden" }}>
      {text.split("").map((char, index) => (
        <span
          key={`${char}-${index}`}
          style={{
            display: "inline-block",
            transform: "translate3d(0, 175%, 0)",
            animation: `project-char-up 1.5s ${EASE} ${delay + index * 0.012}s forwards`,
            whiteSpace: char === " " ? "pre" : undefined,
          }}
        >
          {char === " " ? " " : char}
        </span>
      ))}
    </span>
  );
}

export function ProjectMeta({ project }: Props) {
  const monoFont = '"IBM Plex Mono", monospace';
  const creditEntries = Object.entries(project.credits);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.12, rootMargin: "0px 0px -8%" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const locationStr = Array.isArray(project.meta.location) ? project.meta.location.join(", ") : project.meta.location;
  const coordsStr = project.meta.coords && project.meta.coords.length > 0 ? project.meta.coords.join(", ") : null;
  const revealStyle: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? "translate3d(0,0,0)" : "translate3d(0,100%,0)",
    transition: `opacity .65s ${EASE}, transform .65s ${EASE}`,
  };

  return (
    <div ref={sectionRef} className="extra__wrapper" style={{ padding: 0, opacity: 1, marginTop: 0 }}>
      <style>{`@keyframes project-char-up { to { transform: translate3d(0, 0%, 0); } }`}</style>
      <div className="video_aux__wrapper" style={{ padding: "15px 60px 0", marginBottom: 15, textTransform: "uppercase" }}>
        <div className="main_meta__wrapper" style={{ position: "relative", display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", width: "100%", marginTop: 10, overflow: "hidden" }}>
          <div className="meta_first_col" style={{ ...revealStyle, display: "flex", flexDirection: "row", fontFamily: '"Sporty Pro Black", sans-serif', fontSize: "4vw", fontStretch: "extra-condensed", fontWeight: 700, lineHeight: 0.8, whiteSpace: "nowrap", overflow: "hidden" }}>
            <div className="proj-title__wrapper"><RevealText text={project.title} /></div>
          </div>
          <div className="meta_second_col" aria-hidden="true" style={{ position: "absolute", left: "50%", overflow: "hidden", transform: "translateX(-50%)" }} />
          <div className="meta_third_col" style={{ ...revealStyle, fontFamily: '"Sporty Pro Black", sans-serif', fontSize: "4vw", fontStretch: "extra-condensed", fontWeight: 700, lineHeight: 0.8, whiteSpace: "nowrap", overflow: "hidden", textAlign: "right", transitionDelay: ".12s" }}>
            {project.artist && <RevealText text={project.artist} delay={0.12} />}
          </div>
        </div>

        <div className="secondary_meta__wrapper" style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", paddingTop: 60, ...revealStyle, transitionDelay: ".2s" }}>
          <div className="sm_left" style={{ display: "flex", flexDirection: "row", position: "relative", justifyContent: "space-between", width: "50%", paddingBottom: 200 }}>
            <div className="credit__wrapper" style={{ display: "flex", flexDirection: "row", width: "100%" }}>
              <div className="m_title" style={{ paddingRight: "5.5vw", fontFamily: monoFont, fontSize: "max(min(1.75vw, 11px), 9px)", color: "#f6f6f6" }}>CREDIT</div>
              <div style={{ display: "flex", flexDirection: "row", minWidth: 0 }}>
                <div className="meta_col_keys" style={{ display: "flex", flexDirection: "column", paddingRight: 45, gap: 2 }}>{creditEntries.map(([key]) => <div key={key} className="mk" style={{ fontFamily: monoFont, fontSize: "max(min(1.75vw, 11px), 9px)", color: "#f6f6f6", whiteSpace: "nowrap" }}>{key}</div>)}</div>
                <div className="meta_col_values" style={{ display: "flex", flexDirection: "column", gap: 2 }}>{creditEntries.map(([key, value]) => <div key={key} className="mv" style={{ fontFamily: monoFont, fontSize: "max(min(1.75vw, 11px), 9px)", color: "#f6f6f6", whiteSpace: "nowrap" }}>{value}</div>)}</div>
              </div>
            </div>
            <div className="sm_keywords__wrapper" style={{ bottom: 0, overflow: "hidden", position: "absolute", whiteSpace: "nowrap", width: "100%" }}>
              {project.keywords.map((kw, index) => <span key={kw} className="keyword_item" style={{ display: "inline-block", paddingLeft: index === 0 ? 0 : "max(6%, 30px)", fontFamily: monoFont, fontSize: "max(min(1.75vw, 11px), 9px)", color: "#f6f6f6" }}>{kw}</span>)}
            </div>
          </div>

          <div className="sm_right" style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", position: "relative", width: "50%" }}>
            {project.description && <div className="sm_description__wrapper" style={{ display: "flex", flexDirection: "column", height: "33%", justifyContent: "center", maxWidth: "40%", paddingLeft: 10, position: "relative", textAlign: "left", fontFamily: monoFont, fontSize: "max(min(1.75vw, 11px), 9px)", color: "#f6f6f6" }}>{project.description}</div>}
            <div className="meta_info_row__wrapper" style={{ display: "flex", justifyContent: "space-between", width: project.description ? "50%" : "100%" }}>
              <div className="credit__wrapper" style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end", width: "100%" }}>
                <div className="meta_col_values" style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-start" }}>
                  {project.meta.date && <div className="mv" style={{ paddingBottom: 30, fontFamily: monoFont, fontSize: "max(min(1.75vw, 11px), 9px)", color: "#f6f6f6" }}>{project.meta.date}</div>}
                  {locationStr && <div className="mv" style={{ fontFamily: monoFont, fontSize: "max(min(1.75vw, 11px), 9px)", color: "#f6f6f6" }}>{locationStr}</div>}
                  {coordsStr && <div className="mv" style={{ fontFamily: monoFont, fontSize: "max(min(1.75vw, 11px), 9px)", color: "#f6f6f6" }}>{coordsStr}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

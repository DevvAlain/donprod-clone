"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ProjectTransition, type TransitionOrigin } from "./ProjectTransition";

interface ProjectOpen {
  href: string;
  thumbSrc: string;
  placeholderSrc: string;
  fromRect?: TransitionOrigin;
}

interface RouteTransitionContextValue {
  navigate: (href: string) => void;
  openProject: (opts: ProjectOpen) => void;
}

const RouteTransitionContext = createContext<RouteTransitionContextValue | null>(null);

function samePath(a: string, b: string) {
  return a.replace(/\/$/, "") === b.replace(/\/$/, "");
}

export function RouteTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const pendingHref = useRef<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "cover" | "reveal">("idle");
  const [projectMorph, setProjectMorph] = useState<Omit<ProjectOpen, "href"> | null>(null);

  const navigate = useCallback(
    (href: string) => {
      if (samePath(href, pathname) || phase !== "idle" || projectMorph) return;
      if (href.startsWith("/admin") || pathname.startsWith("/admin")) {
        router.push(href, { scroll: false });
        return;
      }
      pendingHref.current = href;
      setPhase("cover");
      window.setTimeout(() => {
        router.push(href, { scroll: false });
      }, 480);
    },
    [pathname, phase, projectMorph, router],
  );

  const openProject = useCallback(
    ({ href, thumbSrc, placeholderSrc, fromRect }: ProjectOpen) => {
      if (samePath(href, pathname) || phase !== "idle" || projectMorph) return;
      router.prefetch(href);
      if (thumbSrc && window.innerWidth >= 768) {
        setProjectMorph({ thumbSrc, placeholderSrc, fromRect });
      }
      window.setTimeout(() => {
        router.push(href, { scroll: false });
      }, 0);
    },
    [pathname, phase, projectMorph, router],
  );

  useEffect(() => {
    if (phase !== "cover") return;
    const href = pendingHref.current;
    const arrived = href ? samePath(pathname, href) : false;
    const delay = arrived ? 0 : 900;
    const timer = window.setTimeout(() => {
      pendingHref.current = null;
      setPhase("reveal");
    }, delay);
    return () => window.clearTimeout(timer);
  }, [pathname, phase]);

  useEffect(() => {
    if (phase !== "reveal") return;
    const timer = window.setTimeout(() => setPhase("idle"), 700);
    return () => window.clearTimeout(timer);
  }, [phase]);

  return (
    <RouteTransitionContext.Provider value={{ navigate, openProject }}>
      {children}
      {projectMorph ? (
        <ProjectTransition
          thumbSrc={projectMorph.thumbSrc}
          placeholderSrc={projectMorph.placeholderSrc}
          fromRect={projectMorph.fromRect}
          onAnimationEnd={() => setProjectMorph(null)}
        />
      ) : null}
      <div
        className={`dp-route-transition${phase === "cover" ? " is-cover" : ""}${phase === "reveal" ? " is-reveal" : ""}`}
        aria-hidden="true"
      >
        <div className="dp-rt-stage">
          <span className="dp-rt-plane" />
          <span className="dp-rt-plane" />
          <span className="dp-rt-plane" />
        </div>
      </div>
    </RouteTransitionContext.Provider>
  );
}

export function useRouteTransition() {
  const context = useContext(RouteTransitionContext);
  if (!context) throw new Error("useRouteTransition must be used inside RouteTransitionProvider");
  return context;
}

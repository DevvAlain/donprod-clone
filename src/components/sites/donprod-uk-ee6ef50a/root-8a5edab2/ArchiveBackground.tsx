"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { DonprodProject } from "@/types/donprod";

interface ArchiveBackgroundProps {
  project: DonprodProject | null;
  activeIdx: number;
  isVisible: boolean;
}

export function ArchiveBackground({ project, activeIdx, isVisible }: ArchiveBackgroundProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // stiffness: 200, damping: 30 as specified in original
  const springX = useSpring(mouseX, { stiffness: 200, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const offsetX = (e.clientX - window.innerWidth / 2) * 0.06;
      const offsetY = (e.clientY - window.innerHeight / 2) * 0.06;
      mouseX.set(offsetX);
      mouseY.set(offsetY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    // .archive_background_element_wrapper
    // aspect-ratio: 1.33; height: max(25vw, 400px); pointer-events: none;
    // position: fixed; left: 50%; top: 50%; transform: translate3d(-50%,-50%,0);
    // transition: opacity 1s ease; z-index: -1 (rendered before list in DOM = behind it)
    <div
      style={{
        aspectRatio: "1.33",
        height: "max(25vw, 400px)",
        pointerEvents: "none",
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: "translate3d(-50%, -50%, 0)",
        transition: "opacity 1s ease",
        zIndex: 0,
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* .sw: height: 100%; position: absolute; width: 100%; left: 50%; top: 50%; transform: translate3d(-50%,-50%,0) */}
      <div
        style={{
          height: "100%",
          position: "absolute",
          width: "100%",
          left: "50%",
          top: "50%",
          transform: "translate3d(-50%, -50%, 0)",
        }}
      >
        <AnimatePresence>
          {project && (
            // .archv_background_ele: height: 100%; position: absolute; width: 100%;
            // left: 0; top: 0; overflow: hidden; transform-origin: center
            <motion.div
              key={`archv-bg-${activeIdx}`}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { duration: 0.6, ease: "easeOut" },
              }}
              exit={{
                opacity: 0,
                transition: { duration: 0.4 },
              }}
              style={{
                x: springX,
                y: springY,
                height: "100%",
                position: "absolute",
                width: "100%",
                left: 0,
                top: 0,
                overflow: "hidden",
                transformOrigin: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.thumbnails.desktop}
                alt={project.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { DonprodProject } from "@/types/donprod";

interface HomeArchiveViewProps {
  projects: DonprodProject[];
}

const SCATTER_POSITIONS: Array<{ x: string; y: string; w: string }> = [
  { x: "2%",  y: "4%",  w: "95px" },
  { x: "47%", y: "2%",  w: "108px" },
  { x: "89%", y: "3%",  w: "100px" },
  { x: "22%", y: "22%", w: "118px" },
  { x: "74%", y: "20%", w: "88px" },
  { x: "5%",  y: "38%", w: "130px" },
  { x: "40%", y: "37%", w: "95px" },
  { x: "78%", y: "37%", w: "105px" },
  { x: "15%", y: "57%", w: "100px" },
  { x: "55%", y: "55%", w: "115px" },
  { x: "88%", y: "56%", w: "90px" },
  { x: "2%",  y: "72%", w: "95px" },
  { x: "30%", y: "70%", w: "108px" },
  { x: "64%", y: "72%", w: "100px" },
  { x: "88%", y: "73%", w: "88px" },
  { x: "12%", y: "85%", w: "105px" },
  { x: "45%", y: "87%", w: "90px" },
  { x: "76%", y: "85%", w: "115px" },
  { x: "33%", y: "10%", w: "90px" },
  { x: "60%", y: "10%", w: "100px" },
  { x: "8%",  y: "20%", w: "85px" },
  { x: "50%", y: "20%", w: "95px" },
  { x: "92%", y: "45%", w: "88px" },
  { x: "35%", y: "50%", w: "110px" },
  { x: "20%", y: "42%", w: "95px" },
  { x: "68%", y: "43%", w: "105px" },
  { x: "25%", y: "80%", w: "90px" },
  { x: "58%", y: "80%", w: "100px" },
  { x: "42%", y: "62%", w: "88px" },
];

export function HomeArchiveView({ projects }: HomeArchiveViewProps) {
  const router = useRouter();
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: "#000",
      }}
    >
      {projects.map((project, i) => {
        const pos = SCATTER_POSITIONS[i % SCATTER_POSITIONS.length];
        const isHovered = hoveredSlug === project.slug;

        return (
          <div
            key={project.slug}
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              width: pos.w,
              cursor: "pointer",
              opacity: isHovered ? 1.0 : 0.85,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={() => setHoveredSlug(project.slug)}
            onMouseLeave={() => setHoveredSlug(null)}
            onClick={() => router.push(`/project/${project.slug.toLowerCase()}`)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.thumbMobile}
              alt={project.title}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </div>
        );
      })}
    </div>
  );
}

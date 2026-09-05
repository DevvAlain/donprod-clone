"use client";

import React from "react";
import { HomeAuxLeft } from "./HomeAuxLeft";
import { HomeAuxRight } from "./HomeAuxRight";
import { DonprodProject } from "@/types/donprod";

interface HomeAuxOverlayProps {
  projects: DonprodProject[];
  activeIndex: number;
  activeFilter: number | null;
  onFilterChange: (filter: number | null) => void;
  viewMode?: "list" | "archive";
  onViewModeChange?: (mode: "list" | "archive") => void;
}

export function HomeAuxOverlay({
  projects,
  activeIndex,
  activeFilter,
  onFilterChange,
  viewMode = "list",
  onViewModeChange,
}: HomeAuxOverlayProps) {
  const activeProject = projects[activeIndex] ?? null;
  const activeProjectForRight = activeProject
    ? { artist: activeProject.artist ?? null, title: activeProject.title }
    : null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "row",
        padding: "20px",
        boxSizing: "border-box",
        pointerEvents: "none",
      }}
    >
      <HomeAuxLeft
        projects={projects}
        activeIndex={activeIndex}
        totalCount={projects.length}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
      />

      {/* Dead center column */}
      <div
        style={{
          width: "405px",
          margin: "0 20px",
          flexShrink: 0,
        }}
      />

      <HomeAuxRight
        activeProject={activeProjectForRight}
        activeIndex={activeIndex + 1}
        totalCount={projects.length}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      />
    </div>
  );
}

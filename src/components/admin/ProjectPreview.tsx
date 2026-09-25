"use client";

import { X } from "lucide-react";
import type { DonprodProject } from "@/types/donprod";
import { ProjectDetailPage } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/ProjectDetailPage";

export function ProjectPreview({
  project,
  onClose,
}: {
  project: DonprodProject;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Project preview">
      <div className="relative h-full overflow-hidden bg-black shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-[110] inline-flex items-center gap-2 border border-white/30 bg-black/80 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white transition hover:border-white"
          aria-label="Close project preview"
        >
          <X size={14} />
          Close preview
        </button>
        <div className="h-full overflow-auto">
          <ProjectDetailPage project={project} preview />
        </div>
      </div>
    </div>
  );
}

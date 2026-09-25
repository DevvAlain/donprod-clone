"use client";

import { useParams } from "next/navigation";
import { usePublicProjects } from "@/hooks/use-public-projects";
import { ProjectDetailPage } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/ProjectDetailPage";

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const { projects, isLoading } = usePublicProjects();
  const key = decodeURIComponent(slug ?? "").toLowerCase();
  const index = projects.findIndex((item) => item.slug.toLowerCase() === key);
  const project = index >= 0 ? projects[index] : null;
  const total = projects.length;
  const prevProject = total > 0 ? projects[(index - 1 + total) % total] : undefined;
  const nextProject = total > 0 ? projects[(index + 1) % total] : undefined;

  if (isLoading || !project || !prevProject || !nextProject) {
    return <main className="min-h-screen bg-black" aria-busy={isLoading} />;
  }

  return (
    <ProjectDetailPage
      project={project}
      prevProject={prevProject}
      nextProject={nextProject}
    />
  );
}

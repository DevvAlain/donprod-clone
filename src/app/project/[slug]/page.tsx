import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailPage } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/ProjectDetailPage";
import { getProjectBySlug, listProjects } from "@/services/projects";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found | DONPROD" };
  const title = project.seoTitle || project.title;
  const description = project.seoDescription || project.description || `${project.title}${project.artist ? ` — ${project.artist}` : ""}`;
  return {
    title: `${title} | DONPROD`,
    description,
    openGraph: { title, description, images: project.ogImageUrl || project.thumbDesktop ? [{ url: project.ogImageUrl || project.thumbDesktop }] : [] },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;

  const [project, projects] = await Promise.all([getProjectBySlug(slug), listProjects()]);
  if (!project) notFound();
  const index = projects.findIndex((item) => item.slug.toLowerCase() === project.slug.toLowerCase());
  const total = projects.length;
  const prevProject = projects[(index - 1 + total) % total];
  const nextProject = projects[(index + 1) % total];
  if (!prevProject || !nextProject) notFound();

  return (
    <ProjectDetailPage
      project={project}
      prevProject={prevProject}
      nextProject={nextProject}
    />
  );
}

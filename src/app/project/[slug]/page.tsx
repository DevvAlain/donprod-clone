import { notFound } from "next/navigation";
import { DONPROD_PROJECTS } from "@/types/donprod";
import { ProjectDetailPage } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/ProjectDetailPage";

export function generateStaticParams() {
  return DONPROD_PROJECTS.map((project) => ({
    slug: project.slug.toLowerCase(),
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;

  const project = DONPROD_PROJECTS.find(
    (p) => p.slug.toLowerCase() === slug.toLowerCase()
  );

  if (!project) {
    notFound();
  }

  const index = DONPROD_PROJECTS.indexOf(project);
  const total = DONPROD_PROJECTS.length;
  const prevProject = DONPROD_PROJECTS[(index - 1 + total) % total];
  const nextProject = DONPROD_PROJECTS[(index + 1) % total];

  return (
    <ProjectDetailPage
      project={project}
      prevProject={prevProject}
      nextProject={nextProject}
    />
  );
}

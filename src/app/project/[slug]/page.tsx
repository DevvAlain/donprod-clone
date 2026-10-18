import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetailPage } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/ProjectDetailPage";
import { getProjectBySlug, listProjects } from "@/services/projects";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const FALLBACK_IMAGE = "/seo/og-archive.jpg";

function projectLabel(project: { title: string; artist: string | null }) {
  return project.artist ? `${project.title} (${project.artist})` : project.title;
}

function buildTitle(project: { title: string; artist: string | null; seoTitle?: string | null }) {
  if (project.seoTitle) return project.seoTitle;
  return `${projectLabel(project)} — I8 STUDIO`;
}

function buildDescription(project: {
  title: string;
  artist: string | null;
  description: string;
  seoDescription?: string | null;
}) {
  const explicit = project.seoDescription?.trim();
  if (explicit) return explicit.slice(0, 155);
  const body = project.description?.trim();
  if (body && body.length >= 110) return body.slice(0, 155);
  const subject = project.artist ? `${project.title} (${project.artist})` : project.title;
  return `${subject} — a project by I8 STUDIO. Watch the film, browse the stills and read the full credits.`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(decodeURIComponent(slug)).catch(() => null);
  if (!project) return { title: "Not found — I8 STUDIO", robots: { index: false, follow: false } };

  const title = buildTitle(project);
  const description = buildDescription(project);
  const image = project.ogImageUrl || project.thumbDesktop || FALLBACK_IMAGE;
  const canonical = `/project/${project.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      siteName: "I8 STUDIO",
      title,
      description,
      images: [{ url: image, alt: project.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ProjectRoute({ params }: PageProps) {
  const { slug } = await params;
  const projects = await listProjects().catch(() => []);
  const key = decodeURIComponent(slug ?? "").toLowerCase();
  const index = projects.findIndex((item) => item.slug.toLowerCase() === key);
  if (index < 0) notFound();

  const total = projects.length;
  const project = projects[index];
  const prevProject = total > 1 ? projects[(index - 1 + total) % total] : undefined;
  const nextProject = total > 1 ? projects[(index + 1) % total] : undefined;

  return (
    <ProjectDetailPage
      project={project}
      prevProject={prevProject}
      nextProject={nextProject}
    />
  );
}

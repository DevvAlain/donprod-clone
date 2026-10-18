import { permanentRedirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectsSlugPage({ params }: PageProps) {
  const { slug } = await params;
  permanentRedirect(`/project/${encodeURIComponent(slug)}`);
}

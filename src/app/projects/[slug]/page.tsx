import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectsSlugPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/project/${encodeURIComponent(slug)}`);
}

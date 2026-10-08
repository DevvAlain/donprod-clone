import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TvcDetailPage } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/TvcDetailPage";
import { getTvcItemBySlug } from "@/services/tvc";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getTvcItemBySlug(decodeURIComponent(slug)).catch(() => null);
  if (!item) return { title: "Not found — I8 STUDIO" };
  return {
    title: `${item.title} — I8 STUDIO`,
    description: item.description?.slice(0, 160) ?? `${item.title} on I8 Studio Commercial.`,
  };
}

export default async function TvcDetailRoute({ params }: PageProps) {
  const { slug } = await params;
  const item = await getTvcItemBySlug(decodeURIComponent(slug)).catch(() => null);
  if (!item) notFound();
  return <TvcDetailPage />;
}

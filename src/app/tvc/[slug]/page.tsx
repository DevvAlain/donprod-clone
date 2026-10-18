import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TvcDetailPage } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/TvcDetailPage";
import { getYouTubeVideoId } from "@/lib/youtube";
import { getTvcItemBySlug } from "@/services/tvc";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const FALLBACK_IMAGE = "/seo/og-tvc.jpg";
const SITE_URL = "https://i8.com.vn";

function absolute(url: string) {
  return /^https?:\/\//i.test(url) ? url : `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

function buildDescription(item: { title: string; description: string | null }) {
  const base = item.description?.trim() ?? "";
  if (base.length >= 110) return base.slice(0, 155);
  return `${item.title} — TV commercial produced by I8 STUDIO. Watch the film, browse the campaign stills and read the full credits.`;
}

function uploadDate(dateLabel: string | null | undefined) {
  if (!dateLabel) return undefined;
  if (/^\d{4}$/.test(dateLabel)) return `${dateLabel}-01-01`;
  if (/^\d{4}-\d{2}$/.test(dateLabel)) return `${dateLabel}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateLabel)) return dateLabel;
  return undefined;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getTvcItemBySlug(decodeURIComponent(slug)).catch(() => null);
  if (!item) return { title: "Not found — I8 STUDIO", robots: { index: false, follow: false } };
  const title = `${item.title} — I8 STUDIO`;
  const description = buildDescription(item);
  const image = item.imageUrl || item.gallery[0]?.imageUrl || FALLBACK_IMAGE;
  const canonical = `/tvc/${item.slug}`;
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
      images: [{ url: image, alt: item.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function TvcDetailRoute({ params }: PageProps) {
  const { slug } = await params;
  const item = await getTvcItemBySlug(decodeURIComponent(slug)).catch(() => null);
  if (!item) notFound();

  const videoId = item.youtubeUrl ? getYouTubeVideoId(item.youtubeUrl) : null;
  const videoSchema = videoId
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: item.title,
        description: buildDescription(item),
        thumbnailUrl: [absolute(item.imageUrl || item.gallery[0]?.imageUrl || FALLBACK_IMAGE)],
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        contentUrl: item.youtubeUrl,
        ...(uploadDate(item.dateLabel) ? { uploadDate: uploadDate(item.dateLabel) } : {}),
      }
    : null;

  return (
    <>
      {videoSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
        />
      ) : null}
      <TvcDetailPage initialItem={item} />
    </>
  );
}

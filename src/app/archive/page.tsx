import type { Metadata } from "next";
import { ArchivePage } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/ArchivePage";
import { listProjects } from "@/services/projects";

export const dynamic = "force-dynamic";

const TITLE = "Archive — I8 Studio Selected Work (2023–2026)";
const DESCRIPTION =
  "The full I8 Studio archive: music videos, TV commercials and campaign films produced between 2023 and 2026. Browse every project and watch the work.";
const OG_IMAGE = "/seo/og-archive.jpg";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/archive" },
  openGraph: {
    type: "website",
    url: "/archive",
    siteName: "I8 STUDIO",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "I8 Studio archive" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default async function ArchiveRoute() {
  const projects = await listProjects().catch(() => []);
  return <ArchivePage initialProjects={projects} />;
}

import type { Metadata } from "next";
import { HomePageClient } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/HomePageClient";
import { listProjects } from "@/services/projects";

export const dynamic = "force-dynamic";

const TITLE = "I8 Studio — Director Showcase, TVC & Commercial Production";
const DESCRIPTION =
  "I8 Studio is a director-led showcase for TVC & commercial work (2023–2026). Browse the archive, watch TVCs and contact for production.";
const OG_IMAGE = "/seo/og-home.jpg";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "I8 STUDIO",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "I8 STUDIO — director showcase" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: { index: true, follow: true },
};

export default async function HomePage() {
  // Server-render the project list so crawlers and social unfurlers see the
  // work without executing JavaScript. DB failures degrade to the empty state.
  const projects = await listProjects().catch(() => []);
  return <HomePageClient initialProjects={projects} />;
}

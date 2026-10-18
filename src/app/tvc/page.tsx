import type { Metadata } from "next";
import { TvcPage } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/TvcPage";
import { listTvcItems } from "@/services/tvc";

export const dynamic = "force-dynamic";

const TITLE = "Commercial — I8 Studio TVC & Photoshoot Campaigns";
const DESCRIPTION =
  "Commercial work by I8 Studio: photoshoot campaigns and TV commercials for fashion, sport and lifestyle brands. Browse the films, stills and credits.";
const OG_IMAGE = "/seo/og-tvc.jpg";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/tvc" },
  openGraph: {
    type: "website",
    url: "/tvc",
    siteName: "I8 STUDIO",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "I8 Studio commercial work" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default async function TvcRoute() {
  const items = await listTvcItems().catch(() => []);
  return <TvcPage initialItems={items} />;
}

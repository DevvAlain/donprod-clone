import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { RouteTransitionProvider } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/RouteTransition";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://i8.com.vn"),
  title: "I8 Studio — Director Showcase, TVC & Commercial Production",
  description:
    "I8 Studio is a director-led showcase for TVC & commercial work (2023–2026). Browse the archive, watch TVCs and contact for production.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "I8 STUDIO",
    title: "I8 Studio — Director Showcase, TVC & Commercial Production",
    description:
      "I8 Studio is a director-led showcase for TVC & commercial work (2023–2026). Browse the archive, watch TVCs and contact for production.",
    images: [
      {
        url: "/icon.png",
        alt: "I8 STUDIO",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "I8 Studio — Director Showcase, TVC & Commercial Production",
    description:
      "I8 Studio is a director-led showcase for TVC & commercial work (2023–2026). Browse the archive, watch TVCs and contact for production.",
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.png",
  },
};

const SITE_URL = "https://i8.com.vn";

// Only facts verifiable on the site itself: name, URL, logo, tagline.
// Omitted deliberately: sameAs (linked handles say "donprod", unverified for
// I8 STUDIO), founding dates, address, contactPoint (not published on site),
// CreativeWork/VideoObject (project slugs, upload dates and durations are
// runtime data / unknown — emitting them would invent metadata).
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "I8 STUDIO",
      url: SITE_URL,
      logo: `${SITE_URL}/icon.png`,
      description:
        "I8 Studio is a director-led showcase for TVC & commercial work (2023–2026).",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "I8 STUDIO",
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={ibmPlexMono.variable}>
      <body className="bg-black text-[#f6f6f6]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
        <RouteTransitionProvider>{children}</RouteTransitionProvider>
      </body>
    </html>
  );
}

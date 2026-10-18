import type { Metadata } from "next";
import { ContactPage } from "@/components/sites/donprod-uk-ee6ef50a/root-8a5edab2/ContactPage";

const TITLE = "Contact — I8 Studio TVC & Commercial Production";
const DESCRIPTION =
  "Contact I8 Studio for TVC, commercial and campaign production. Based in Vietnam, available for shoots and collaborations across Asia — get in touch to book.";
const OG_IMAGE = "/seo/og-contact.jpg";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    url: "/contact",
    siteName: "I8 STUDIO",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Contact I8 Studio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function ContactRoute() {
  return <ContactPage />;
}

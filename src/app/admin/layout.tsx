import type { Metadata } from "next";

// The CMS is private: never index it, never follow its links, and never let
// search engines cache the login or dashboard pages.
export const metadata: Metadata = {
  title: "I8 CMS",
  description: "I8 Studio internal content management system.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}

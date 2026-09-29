import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 — Page Not Found — I8 STUDIO",
  description: "The page you are looking for does not exist on I8 Studio.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
      }}
    >
      <h1
        style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: "24px",
          fontWeight: 500,
        }}
      >
        404
      </h1>
      <p
        style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: "12px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#868686",
        }}
      >
        This page could not be found
      </p>
      <Link
        href="/"
        style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: "12px",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          textDecoration: "underline",
          textUnderlineOffset: "4px",
        }}
      >
        Back to home
      </Link>
    </div>
  );
}

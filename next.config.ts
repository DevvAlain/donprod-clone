import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// React dev mode needs eval() for debugging callstacks; production never
// uses it, so 'unsafe-eval' is dev-only. (Without it, `next dev` logs:
// "eval() is not supported in this environment...".)
const scriptSrc = isDev
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:"
  : "script-src 'self' 'unsafe-inline' https:";

const nextConfig: NextConfig = {
  // Required for the Docker standalone image (Dockerfile target "runner").
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            // Permissive on inline scripts/styles because Next.js App Router
            // hydrates via inline RSC payloads; value comes from restricting
            // sources, object/base/frame scope rather than blocking inline.
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              scriptSrc,
              "style-src 'self' 'unsafe-inline' https:",
              "img-src 'self' data: blob: https:",
              "media-src 'self' blob: https:",
              "font-src 'self' data: https:",
              "connect-src 'self' https:",
              "frame-src 'self' https:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

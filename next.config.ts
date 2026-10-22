import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  typedRoutes: true,
  poweredByHeader: false,
  // Every route is prerendered with its metadata already in <head>, so no
  // crawler or audit tool needs the blocking dynamic render Next gives the
  // user agents on its default list: they get the cached page like anyone.
  htmlLimitedBots: /x^/,
  images: {
    formats: ["image/avif", "image/webp"],
    // Screenshots only change with a deploy.
    minimumCacheTTL: 2592000,
  },
  experimental: {
    // One 404 page for every unmatched URL, since the root layout lives under [lang].
    globalNotFound: true,
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

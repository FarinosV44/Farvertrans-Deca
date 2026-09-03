import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output is for the production Docker image (Hostinger); local dev,
  // `next start` and the test webServer use the default output.
  output: process.env.NEXT_STANDALONE === "1" ? "standalone" : undefined,
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: {
    // lint is run explicitly in CI / test scripts; do not fail the build on it here
    ignoreDuringBuilds: false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;

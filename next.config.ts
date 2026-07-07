import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["local.heyputu.lol", "heyputu.lol", "*.heyputu.lol"],
  async headers() {
    if (process.env.NODE_ENV !== "development") return [];

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
          {
            key: "CDN-Cache-Control",
            value: "no-store",
          },
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "no-store",
          },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      // 4 foto × max 5MB = 20MB, kasih ruang lebih
      bodySizeLimit: "25mb",
      allowedOrigins: ["local.heyputu.lol", "heyputu.lol", "*.heyputu.lol"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.figma.com",
      },
      {
        protocol: "https",
        hostname: "pub-05f22900bb78463e8c271cb0e5bc185a.r2.dev",
      },
      {
        protocol: "https",
        hostname: "heyputu.lol",
      },
    ],
  },
};

export default nextConfig;

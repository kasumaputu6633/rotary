import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["local.heyputu.lol"],
  experimental: {
    serverActions: {
      // 4 foto × max 5MB = 20MB, kasih ruang lebih
      bodySizeLimit: "25mb",
      allowedOrigins: ["local.heyputu.lol"],
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

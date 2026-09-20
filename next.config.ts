import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/admIn",
        destination: "/admin"
      }
    ];
  }
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SWC is enabled by default in Next.js 15
  // Minimal config for stable builds

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;

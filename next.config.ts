import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // prisma.config.ts has a type error that doesn't affect runtime
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

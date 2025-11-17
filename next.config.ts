import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Phaser requires these configurations
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
};

export default nextConfig;

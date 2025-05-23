import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["localhost"],
  },
  // Suppress specific deprecation warnings
  webpack: (config, { isServer }) => {
    // Ignore the node-domexception deprecation warning
    config.ignoreWarnings = [
      { module: /node_modules\/node-domexception/ }
    ];
    
    return config;
  },
};

export default nextConfig;

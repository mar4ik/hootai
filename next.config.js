/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig; 
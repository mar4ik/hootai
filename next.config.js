/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"],
  },
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/\\+\\+api\\+\\+/:slug*",
        destination: "http://localhost:8080/Plone/%2B%2Bapi%2B%2B/:slug*",
      },
    ];
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

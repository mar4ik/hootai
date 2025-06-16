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
  // Environment variables with defaults
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : 'https://www.hootai.am'),
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eaennrqqtlmanbivdhqm.supabase.co',
  },
};

module.exports = nextConfig;

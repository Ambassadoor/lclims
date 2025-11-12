import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Optimizations
  poweredByHeader: false,
  compress: true,

  // For hardware integrations (Web Serial API, etc.)
  experimental: {
    // Enable if needed for specific features
  },

  // Image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com', // For Google profile images
      },
    ],
  },

  // Environment variables exposed to browser
  env: {
    NEXT_PUBLIC_APP_NAME: 'LIMS',
  },
};

export default nextConfig;

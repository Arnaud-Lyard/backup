import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // protocol: "http",
        hostname: '127.0.0.1',
        port: '8000',
      },
    ],
  },
};

export default nextConfig;

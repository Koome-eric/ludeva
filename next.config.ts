import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  // The Money Market Fund page was retired — send old links to the Shares Account page.
  async redirects() {
    return [{ source: '/mmf', destination: '/stocks-bonds', permanent: true }];
  },
  // Allow large file uploads (videos up to ~55 MB)
  experimental: {
    serverActions: {
      bodySizeLimit: '60mb',
    },
  },
};

export default nextConfig;

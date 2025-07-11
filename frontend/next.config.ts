import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dash.hackathons.hackclub.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  /* config options here */
  // typescript: {
  //   ignoreBuildErrors: true, // ✅ This prevents TypeScript from stopping the build
  // },
};

export default nextConfig;

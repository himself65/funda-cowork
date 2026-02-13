import path from 'node:path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@vercel/sandbox"],
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: path.join(import.meta.dirname, '../..'),
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

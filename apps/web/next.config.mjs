/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@vercel/sandbox"],
  turbopack: {
    root: import.meta.dirname,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

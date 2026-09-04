/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // SEO optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Generate static pages for better SEO
  output: 'standalone',
}

export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true
  },
  output: 'export',
  distDir: '.next',
  trailingSlash: true,
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : ''
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    // Prevent three.js errors during SSR
    if (isServer) {
      config.externals.push({
        'three': 'commonjs three',
        'postprocessing': 'commonjs postprocessing'
      });
    }
    return config;
  }
}

module.exports = nextConfig

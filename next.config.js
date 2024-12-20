/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      module: false,
    };
    return config;
  },
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei']
}

module.exports = nextConfig

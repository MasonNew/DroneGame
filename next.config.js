/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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
      path: false,
      stream: false,
      crypto: false,
      zlib: false,
      http: false,
      https: false,
      url: false,
      util: false,
      os: false,
      assert: false,
    };
    if (config.mode === 'production') {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        moduleIds: 'deterministic',
      };
    }
    return config;
  },
  transpilePackages: [
    'three',
    '@react-three/fiber',
    '@react-three/drei',
    '@react-three/postprocessing'
  ],
  poweredByHeader: false,
  generateEtags: false,
  compress: true
}

module.exports = nextConfig

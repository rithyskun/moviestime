import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Exclude Node.js modules from client bundle
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        stream: false,
        fs: false,
        path: false,
        crypto: false,
        net: false,
        tls: false,
        http: false,
        https: false,
        zlib: false,
        buffer: false,
        util: false,
        os: false,
        constants: false,
      };

      // Mark webtorrent and related packages as external
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        'webtorrent',
        'end-of-stream',
        'pump',
      ];
    }
    return config;
  },
};

export default nextConfig;

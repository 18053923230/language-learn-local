import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Enable WASM support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Handle WASM files
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });

    // Allow WASM imports
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };

    return config;
  },

  // SEO and Performance Optimization
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          // Cache control for static assets
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    domains: ["fluentreact.com"],
    formats: ["image/webp", "image/avif"],
  },

  // Compression and optimization
  compress: true,

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: "/language-reactor",
        destination: "/language-reactor-alternative",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

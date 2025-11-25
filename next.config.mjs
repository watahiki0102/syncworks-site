/**
 * Next.js configuration in ESM format.
 * Converted from TypeScript (next.config.ts) to be supported by Next.js.
 */

const nextConfig = {
  // Experimental features
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  // Image optimization settings
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
  },

  // Enable compression
  compress: true,

  // Remove X-Powered-By header
  poweredByHeader: false,

  // Enable React strict mode
  reactStrictMode: true,

  // TypeScript build settings - ビルド時に型エラーを検出
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint settings - ビルド時にリントエラーを検出
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Build-time optimizations
  ...(process.env.NODE_ENV === "production" && {
    compiler: {
      removeConsole: true,
    },
  }),

  // Security and caching headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Redirect settings
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/dashboard",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;


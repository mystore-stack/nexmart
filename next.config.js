/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: require('path').resolve(__dirname),
  
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.nexmart.com" },
      { protocol: "https", hostname: "tse2.mm.bing.net" },
      { protocol: "https", hostname: "*.mm.bing.net" },
      { protocol: "https", hostname: "coresg-normal.trae.ai" },
      { protocol: "https", hostname: "cdn.dummyjson.com" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    qualities: [75, 85, 90, 95],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://js.stripe.com",
            "worker-src 'self' blob:",
            "frame-src https://js.stripe.com",
            "connect-src 'self' https://api.stripe.com https://*.sentry.io https://*.ingest.sentry.io",
            "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://coresg-normal.trae.ai https://cdn.dummyjson.com",
            "style-src 'self' 'unsafe-inline'",
          ].join("; "),
        },
      ],
    },
  ],
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

module.exports = nextConfig;

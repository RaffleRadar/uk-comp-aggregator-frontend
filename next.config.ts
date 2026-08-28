import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    minimumCacheTTL: 2678400,
    deviceSizes: [640, 750, 1080, 1920],
    imageSizes: [300, 600],
    remotePatterns: [
      { protocol: "https", hostname: "img.raffleradar.co.uk", pathname: "/**" },
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/**" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/uk-competitions-ending-today",
        destination: "/competitions-ending-today",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

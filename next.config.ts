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
};

export default nextConfig;

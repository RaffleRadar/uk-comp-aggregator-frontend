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
      { protocol: "https", hostname: "www.revcomps.com", pathname: "/**" },
      { protocol: "https", hostname: "prismic.skywind360.com", pathname: "/**" },
      { protocol: "https", hostname: "7days-production.s3.eu-west-2.amazonaws.com", pathname: "/**" },
      { protocol: "https", hostname: "media.dreamcargiveaways.co.uk", pathname: "/**" },
      { protocol: "https", hostname: "mckinneycompetitions.co.uk", pathname: "/**" },
      { protocol: "https", hostname: "www.mckinneycompetitions.co.uk", pathname: "/**" },
      { protocol: "https", hostname: "imagedelivery.net", pathname: "/**" },
      { protocol: "https", hostname: "mckinneycompetitions.com", pathname: "/**" },
      { protocol: "https", hostname: "www.mckinneycompetitions.com", pathname: "/**" },
      { protocol: "https", hostname: "thegiveawayguys.co.uk", pathname: "/**" },
      { protocol: "https", hostname: "www.thegiveawayguys.co.uk", pathname: "/**" },
      { protocol: "https", hostname: "redline-competitions.com", pathname: "/**" },
      { protocol: "https", hostname: "www.redline-competitions.com", pathname: "/**" },
      { protocol: "https", hostname: "images.elitecompetitions.co.uk", pathname: "/**" },
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/**" },
    ],
  },
};

export default nextConfig;

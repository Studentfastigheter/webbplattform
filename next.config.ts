import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.dropbox.com",
      },
      {
        protocol: "https",
        hostname: "cdn2.hubspot.net",
      },
    ],
  },
};

export default nextConfig;
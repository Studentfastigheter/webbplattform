import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "localhost",
    "192.168.1.126",
    "*.localhost", // om du kör t.ex. app.localhost
  ],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "www.dropbox.com" },
      { protocol: "https", hostname: "cdn2.hubspot.net" },
      { protocol: "https", hostname: "media.licdn.com" },
      {
        protocol: "https",
        hostname: "sgs-fastighet.momentum.se",
        pathname: "/Prod/sgs/PmApi/**",
      },
    ],
  },

  async rewrites() {
    return [
      { source: "/api/:path*", destination: "http://localhost:8080/api/:path*" },
    ];
  },

  async redirects() {
    return [
      { source: "/our-queues", destination: "/alla-koer", permanent: true },
      { source: "/our-queues/:path*", destination: "/alla-koer/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  async rewrites() {
    return {
      afterFiles: [
        {
          source: "/dashboard",
          destination: "/index.html",
        },
        {
          source: "/dashboard/:path*",
          destination: "/index.html",
        },
        {
          source: "/calendars",
          destination: "/index.html",
        },
        {
          source: "/calendars/:path*",
          destination: "/index.html",
        },
        {
          source: "/account",
          destination: "/index.html",
        },
        {
          source: "/account/:path*",
          destination: "/index.html",
        },
        {
          source: "/settings",
          destination: "/index.html",
        },
        {
          source: "/settings/:path*",
          destination: "/index.html",
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

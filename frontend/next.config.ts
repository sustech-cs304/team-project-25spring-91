// frontend/next.config.ts
import type { NextConfig } from "next";

// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/api/uploads/gyms/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/api/uploads/competitions/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/api/uploads/gym-classes/**",
      },
            {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/api/uploads/users/**",
      },
      {
        protocol: "https",
        hostname: "cdn-magazine.nutrabay.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "example.com",
        pathname: "/images/**",
      },
    ],
  },
};

module.exports = nextConfig;

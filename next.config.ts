import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict React mode for catching side effects early
  reactStrictMode: true,

  // Allow images from Firebase Storage
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  // Enforce no-op for production — catch missing env vars at build time
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  },
};

export default nextConfig;

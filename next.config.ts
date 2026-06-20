import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow access from local network devices (phones, tablets)
  allowedDevOrigins: ["192.168.0.164", "192.168.0.*"],

  // Headers for PWA — allow SW scope and caching
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control",   value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=604800" },
        ],
      },
    ];
  },
};

export default nextConfig;

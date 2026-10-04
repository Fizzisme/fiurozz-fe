import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
      // proxy.ts also matches /api/proxy/*, and Next buffers (and silently truncates) request
      // bodies past 10MB. Project creation uploads up to 80MB of media.
      proxyClientMaxBodySize: '80mb',
  },
  images: {
      remotePatterns: [
        { protocol: "https", hostname: "i.pravatar.cc" },
        { protocol: "https", hostname: "images.unsplash.com" },
        { protocol: "https", hostname: "picsum.photos" }, 
      ],
    },
};

export default nextConfig;

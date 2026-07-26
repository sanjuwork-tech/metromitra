import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Let Vercel's default Next.js builder handle output.
     `output: standalone` is removed so Vercel produces a standard build. */
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "z-cdn.chatglm.cn" },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // X(Twitter)のプロフィール画像を表示するために追加
    remotePatterns: [
      { hostname: "pbs.twimg.com" },
      { hostname: "images.unsplash.com" },
      { hostname: "localhost" },
      { hostname: "api-demo-natter.akaaku.net" },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // X(Twitter)のプロフィール画像を表示するために追加
    domains: ["pbs.twimg.com"],
  },
};

export default nextConfig;

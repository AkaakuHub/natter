import React from "react";
import { HybridSPA } from "@/core/HybridSPA";
import { Metadata } from "next";

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;
  const spaPath = params["spa-path"];

  try {
    // ポスト詳細ページの場合
    const postMatch = spaPath?.match(/^\/post\/(\d+)$/);
    if (postMatch) {
      const postId = postMatch[1];
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/ogp?type=post&postId=${postId}`,
        {
          next: { revalidate: 3600 }, // 1時間キャッシュ
        },
      );

      if (response.ok) {
        const ogpData = await response.json();
        return {
          title: ogpData.title,
          description: ogpData.description,
          openGraph: {
            title: ogpData.title,
            description: ogpData.description,
            images: [
              {
                url: ogpData.image,
                width: 1200,
                height: 630,
                alt: ogpData.title,
              },
            ],
            type: "article",
            url: ogpData.url,
            siteName: "Natter",
            publishedTime: ogpData.publishedTime,
          },
          twitter: {
            card: "summary_large_image",
            title: ogpData.title,
            description: ogpData.description,
            images: [ogpData.image],
            creator: `@${ogpData.author}`,
          },
        };
      }
    }

    // デフォルト（トップページ）のメタデータ
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒でタイムアウト

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/ogp?type=top`,
        {
          next: { revalidate: 86400 }, // 24時間キャッシュ
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const ogpData = await response.json();
        return {
          title: ogpData.title,
          description: ogpData.description,
          openGraph: {
            title: ogpData.title,
            description: ogpData.description,
            images: [
              {
                url: ogpData.image,
                width: 1200,
                height: 630,
                alt: "Natter - ソーシャルメディアプラットフォーム",
              },
            ],
            type: "website",
            url: ogpData.url,
            siteName: "Natter",
          },
          twitter: {
            card: "summary_large_image",
            title: ogpData.title,
            description: ogpData.description,
            images: [ogpData.image],
            site: "@natter_app",
          },
        };
      }
    } catch (error) {
      console.error("Failed to generate metadata:", error);
    }
  } catch (error) {
    console.error("Failed to generate metadata:", error);
  }

  // フォールバック
  return {
    title: "Natter - ソーシャルメディアプラットフォーム",
    description: "新しいコミュニケーションの形。Natterで思いを共有しよう。",
    openGraph: {
      title: "Natter",
      description: "新しいコミュニケーションの形。Natterで思いを共有しよう。",
      type: "website",
      url: process.env.NEXT_PUBLIC_BASE_URL,
      siteName: "Natter",
    },
  };
}

const HybridSinglePageApplication = async ({ searchParams }: Props) => {
  const params = await searchParams;
  const ssrPath = params["ssr-path"];
  const spaPath = params["spa-path"];
  const ssrMode = params["ssr-mode"] === "true";

  const initialPath = ssrPath || spaPath || "/";
  return <HybridSPA initialPath={initialPath} ssrMode={ssrMode} />;
};

export default HybridSinglePageApplication;

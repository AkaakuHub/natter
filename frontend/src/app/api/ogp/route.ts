import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type");
  const postId = searchParams.get("postId");

  try {
    if (type === "top") {
      // トップページのOG画像を生成
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/ogp/top`,
      );
      const data = await response.json();

      return NextResponse.json({
        title: "Natter - ソーシャルメディアプラットフォーム",
        description: "新しいコミュニケーションの形。Natterで思いを共有しよう。",
        image: `${process.env.NEXT_PUBLIC_BASE_URL}${data.imagePath}`,
        url: process.env.NEXT_PUBLIC_BASE_URL,
      });
    }

    if (type === "post" && postId) {
      // ポスト詳細のOG画像を生成
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/ogp/${postId}`,
      );
      const data = await response.json();

      // ポスト詳細も取得
      const postResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}`,
      );
      const post = await postResponse.json();

      // コンテンツをクリーンアップ（HTMLエンティティをデコード）
      const cleanContent =
        post.content
          ?.replace(/&lt;/g, "<")
          ?.replace(/&gt;/g, ">")
          ?.replace(/&amp;/g, "&")
          ?.replace(/&quot;/g, '"')
          ?.replace(/&#x27;/g, "'")
          ?.replace(/&#x2F;/g, "/") || "";

      const description =
        cleanContent.length > 200
          ? cleanContent.substring(0, 200) + "..."
          : cleanContent;

      return NextResponse.json({
        title: `${post.author.name}の投稿 - Natter`,
        description: description || "Natterでの投稿をチェック",
        image: `${process.env.NEXT_PUBLIC_BASE_URL}${data.imagePath}`,
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/post/${postId}`,
        author: post.author.name,
        publishedTime: post.createdAt,
      });
    }

    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  } catch (error) {
    console.error("OGP generation failed:", error);
    return NextResponse.json(
      { error: "OGP generation failed" },
      { status: 500 },
    );
  }
}

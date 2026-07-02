import { getAppSessionToken } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const APP_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is required");
}

if (!APP_BASE_URL) {
  throw new Error("NEXT_PUBLIC_BASE_URL is required");
}

type OgpImageResponse = {
  imagePath: string;
};

type PostResponse = {
  id: number;
  author: {
    name: string;
  };
  content: string | null;
  createdAt: string;
};

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  const postId = request.nextUrl.searchParams.get("postId");
  const sessionToken = getAppSessionToken(request);

  if (type === "top") {
    const data = await fetchApiJson<OgpImageResponse>(
      "/posts/ogp/top",
      sessionToken,
    );
    return NextResponse.json({
      title: "Natter - ソーシャルメディアプラットフォーム",
      description: "新しいコミュニケーションの形。Natterで思いを共有しよう。",
      image: `${APP_BASE_URL}${data.imagePath}`,
      url: APP_BASE_URL,
    });
  }

  if (type === "post" && postId) {
    const [imageData, post] = await Promise.all([
      fetchApiJson<OgpImageResponse>(`/posts/ogp/${postId}`, sessionToken),
      fetchApiJson<PostResponse>(`/posts/${postId}`, sessionToken),
    ]);
    const content = decodeHtml(post.content ?? "");
    const description =
      content.length > 200 ? `${content.substring(0, 200)}...` : content;

    return NextResponse.json({
      title: `${post.author.name}の投稿 - Natter`,
      description: description || "Natterでの投稿をチェック",
      image: `${APP_BASE_URL}${imageData.imagePath}`,
      url: `${APP_BASE_URL}/post/${postId}`,
      author: post.author.name,
      publishedTime: post.createdAt,
    });
  }

  return NextResponse.json({ error: "invalid_parameters" }, { status: 400 });
}

async function fetchApiJson<T>(path: string, sessionToken: string | null) {
  const headers = new Headers();
  if (sessionToken) {
    headers.set("authorization", `Bearer ${sessionToken}`);
  }
  const response = await fetch(new URL(path, API_BASE_URL), {
    headers,
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

function decodeHtml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}

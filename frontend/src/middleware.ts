import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // SLEEPANDMAXDEPTHTHINK: 最も単純な解決策
  // ステップ1: SPAルートの判定とリライト処理を最初に実行
  const spaRoutes = ["/login", "/search", "/notification", "/set-list"];
  const isPostDetail = pathname.match(/^\/post\/\d+$/);
  const isProfile =
    pathname === "/profile" || pathname.match(/^\/profile\/\d+/);
  const needsRewrite =
    spaRoutes.includes(pathname) || isPostDetail || isProfile;

  // SPAルートの場合は即座にリライト（認証チェックなし）
  if (needsRewrite) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("spa-path", pathname);

    return NextResponse.rewrite(url);
  }

  // ステップ2: 非SPAルートの認証チェック
  // "/" へのリクエストは認証チェック（SPAページがロードされる）
  if (pathname === "/") {
    const spaPath = req.nextUrl.searchParams.get("spa-path");

    if (spaPath) {
      // 公開ページの判定
      const publicRoutes = ["/login"];
      const isSpaPostDetail = spaPath.match(/^\/post\/\d+$/);
      const isSpaProfile =
        spaPath === "/profile" || spaPath.match(/^\/profile\/\d+/);
      const isPublicSpaPage =
        publicRoutes.includes(spaPath) || isSpaPostDetail || isSpaProfile;

      if (!isPublicSpaPage) {
        // 認証が必要なSPAページ
        try {
          const session = await auth();

          if (!session) {
            console.log(`💀 [AUTH REQUIRED] ${spaPath} -> /login`);
            return NextResponse.redirect(new URL("/login", req.url));
          }
        } catch (error) {
          console.error(`💀 [AUTH ERROR] ${spaPath}:`, error);
          return NextResponse.redirect(new URL("/login", req.url));
        }
      } else {
        console.log(`💀 [PUBLIC SPA PAGE] ${spaPath} - No auth required`);
      }
    } else {
      // 通常のトップページ（認証が必要）
      try {
        const session = await auth();

        if (!session) {
          console.log(`💀 [AUTH REQUIRED] / -> /login`);
          return NextResponse.redirect(new URL("/login", req.url));
        }
      } catch (error) {
        console.error(`💀 [AUTH ERROR] /:`, error);
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // 全てのパスにマッチ（静的アセット以外）
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|api).*)",
  ],
};

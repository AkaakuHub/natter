import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ULTRADEEPTHINK: 最もシンプルなログから開始
  console.log(`💀 [MIDDLEWARE RUNNING] ${pathname}`);

  // 認証が不要なパブリックルート
  const publicRoutes = ["/login"];

  // 認証チェック（パブリックルート以外）
  if (!publicRoutes.includes(pathname)) {
    try {
      const session = await auth();

      if (!session) {
        console.log(`💀 [AUTH REQUIRED] Redirecting ${pathname} to /login`);
        return NextResponse.redirect(new URL("/login", req.url));
      }

      console.log(`💀 [AUTH OK] User authenticated for ${pathname}`);
    } catch (error) {
      console.error(`💀 [AUTH ERROR] ${error}`);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // SPAルートの一覧（静的ルート）
  const spaRoutes = ["/login", "/search", "/notification", "/set-list"];

  // 静的SPAルートをキャッチ
  if (spaRoutes.includes(pathname)) {
    console.log(`💀 [SPA ROUTE DETECTED] ${pathname}`);

    // SPAページにリライト
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("spa-path", pathname);

    console.log(
      `💀 [REWRITING SPA] ${pathname} -> / with spa-path=${pathname}`,
    );
    return NextResponse.rewrite(url);
  }

  // /post/:id の動的ルートをキャッチ
  if (pathname.match(/^\/post\/\d+$/)) {
    console.log(`💀 [POST ROUTE DETECTED] ${pathname}`);

    // SPAページにリライト
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("spa-path", pathname);

    console.log(`💀 [REWRITING] ${pathname} -> / with spa-path=${pathname}`);
    return NextResponse.rewrite(url);
  }

  // /profile/* の動的ルートをキャッチ
  if (
    pathname === "/profile" ||
    pathname.match(/^\/profile\/\d+/) ||
    pathname === "/profile/followers" ||
    pathname === "/profile/following" ||
    pathname.match(/^\/profile\/\d+\/followers$/) ||
    pathname.match(/^\/profile\/\d+\/following$/)
  ) {
    console.log(`💀 [PROFILE ROUTE DETECTED] ${pathname}`);

    // SPAページにリライト
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("spa-path", pathname);

    console.log(`💀 [REWRITING] ${pathname} -> / with spa-path=${pathname}`);
    return NextResponse.rewrite(url);
  }

  console.log(`💀 [PASSING THROUGH] ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    // 全てのパスにマッチ（静的アセット以外）
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|api).*)",
  ],
};

import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ULTRADEEPTHINK: 最もシンプルなログから開始
  console.log(`💀 [MIDDLEWARE RUNNING] ${pathname}`);

  // ログインページはSPAページにリライト（正常なSPAナビゲーション）
  if (pathname === "/login") {
    console.log(`💀 [LOGIN PAGE DETECTED] ${pathname}`);
    
    // SPAページにリライト
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("spa-path", pathname);
    
    console.log(`💀 [REWRITING LOGIN] ${pathname} -> / with spa-path=${pathname}`);
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

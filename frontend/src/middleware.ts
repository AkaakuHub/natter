import { getLocalAuthSession } from "@/auth";
import { getMiddlewarePaths } from "@/core/spa/SPARoutes";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_auth/") || pathname === "/login") {
    return NextResponse.next();
  }

  const routePath =
    pathname === "/" ? req.nextUrl.searchParams.get("spa-path") : pathname;
  if (routePath === "/login") {
    return NextResponse.next();
  }

  const session = await getRequiredSession(req, routePath ?? pathname);
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (routePath === "/profile") {
    return NextResponse.redirect(
      new URL(`/profile/${session.user.id}`, req.url),
    );
  }

  if (pathname !== "/" && isSpaRoute(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("spa-path", pathname);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

async function getRequiredSession(
  req: NextRequest,
  path: string,
): Promise<Awaited<ReturnType<typeof getLocalAuthSession>>> {
  try {
    return await getLocalAuthSession(req);
  } catch (error) {
    console.error(`Auth error for ${path}:`, error);
    return null;
  }
}

function isSpaRoute(pathname: string): boolean {
  return (
    getMiddlewarePaths().includes(pathname) ||
    /^\/post\/\d+$/.test(pathname) ||
    /^\/profile\/\d+(?:\/(?:following|followers))?$/.test(pathname)
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|api|sounds).*)",
  ],
};

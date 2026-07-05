import { getLocalAuthSession } from "@/auth";
import { getMiddlewarePaths } from "@/core/spa/SPARoutes";
import { noStoreHeaders } from "@/http/noStoreHeaders";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_auth/")) {
    return NextResponse.next();
  }

  if (pathname === "/login") {
    if (req.method === "POST") {
      return NextResponse.next();
    }

    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("spa-path", "/login");
    return NextResponse.rewrite(url);
  }

  const routePath =
    pathname === "/" ? req.nextUrl.searchParams.get("spa-path") : pathname;
  if (routePath === "/login") {
    return NextResponse.next();
  }

  const session = await getRequiredSession(req, routePath ?? pathname);
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url), {
      headers: noStoreHeaders,
    });
  }

  if (routePath === "/profile") {
    return NextResponse.redirect(
      new URL(`/profile/${session.user.id}`, req.url),
      { headers: noStoreHeaders },
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
  matcher: ["/((?!_next/static|_next/image|api|.*\\..*).*)"],
};

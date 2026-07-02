import { handleAuthRoute, withLinkAuthRoutePath } from "@/auth";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return await handleAuthRoute(withLinkAuthRoutePath(request, "/_auth/logout"));
}

import { handleAuthRoute } from "@/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return await handleAuthRoute(request);
}

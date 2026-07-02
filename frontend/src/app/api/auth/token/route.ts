import { getAuthSession } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getAuthSession(request);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is required");
  }

  const response = await fetch(`${apiBaseUrl}/auth/token`, {
    body: JSON.stringify({ userId: session.user.id }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "failed_to_create_api_token" },
      { status: response.status },
    );
  }

  return NextResponse.json(await response.json());
}

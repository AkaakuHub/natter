import { createApiTokenForSession, getAuthSession } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getAuthSession(request);
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const response = await createApiTokenForSession(session);
    return NextResponse.json(response.user);
  } catch {
    return NextResponse.json(
      { error: "failed_to_sync_current_user" },
      { status: 502 },
    );
  }
}

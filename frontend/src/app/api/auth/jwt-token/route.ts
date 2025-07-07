import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    // まず復号化されたトークンを取得してデバッグ
    const decodedToken = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!decodedToken) {
      return NextResponse.json({ error: "No session found" }, { status: 401 });
    }

    // 生のJWTトークンを取得
    const rawToken = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      raw: true,
    });

    if (!rawToken) {
      return NextResponse.json(
        { error: "No raw token found" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      token: rawToken,
      decoded: decodedToken, // デバッグ用
    });
  } catch (error) {
    console.error("Error getting JWT token:", error);
    return NextResponse.json(
      {
        error: "Failed to get token",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

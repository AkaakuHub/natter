import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          valid: false,
          error: "Bearer token required",
        },
        { status: 401 },
      );
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.NEXTAUTH_SECRET;

    if (!jwtSecret) {
      console.error("NEXTAUTH_SECRET not configured");
      return NextResponse.json(
        {
          valid: false,
          error: "Server configuration error",
        },
        { status: 500 },
      );
    }

    try {
      // NextAuth.jsのJWTトークンを検証
      const decoded = jwt.verify(token, jwtSecret) as {
        exp?: number;
        iat?: number;
        twitterId?: string;
        name?: string;
      };

      // トークンの有効期限をチェック
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        return NextResponse.json(
          {
            valid: false,
            error: "Token expired",
          },
          { status: 401 },
        );
      }

      // ユーザー情報の存在確認
      if (!decoded.twitterId) {
        return NextResponse.json(
          {
            valid: false,
            error: "Invalid token structure",
          },
          { status: 401 },
        );
      }

      return NextResponse.json({
        valid: true,
        userId: decoded.twitterId,
        tokenInfo: {
          iat: decoded.iat,
          exp: decoded.exp,
          name: decoded.name,
        },
      });
    } catch (jwtError) {
      if (jwtError instanceof jwt.JsonWebTokenError) {
        return NextResponse.json(
          {
            valid: false,
            error: "Invalid JWT signature",
          },
          { status: 401 },
        );
      }
      if (jwtError instanceof jwt.TokenExpiredError) {
        return NextResponse.json(
          {
            valid: false,
            error: "JWT token expired",
          },
          { status: 401 },
        );
      }
      if (jwtError instanceof jwt.NotBeforeError) {
        return NextResponse.json(
          {
            valid: false,
            error: "JWT token not active",
          },
          { status: 401 },
        );
      }

      console.error("JWT verification error:", jwtError);
      return NextResponse.json(
        {
          valid: false,
          error: "Token verification failed",
        },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("JWT verification endpoint error:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}

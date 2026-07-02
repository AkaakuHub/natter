"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const LoginView = () => {
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // URLのクエリパラメータからエラーを取得 - Next.js URLSearchParamsから直接取得
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");

    if (error) {
      switch (error) {
        case "AuthFailed":
          setAuthError(
            "認証でエラーが発生しました。しばらく時間をあけて再度お試しください。",
          );
          break;
        case "SessionRequired":
          setAuthError("セッションが必要です。ログインしてください。");
          break;
        default:
          setAuthError("認証エラーが発生しました。");
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-variant">
      <div className="flex flex-col items-center space-y-6 bg-surface p-8 rounded-lg shadow-md border border-border">
        <Image
          src="/images/logo.png"
          alt="logo"
          width={128}
          height={128}
          priority
        />
        {authError && (
          <div className="text-error text-sm bg-error-bg p-3 rounded-md border border-error">
            {authError}
          </div>
        )}
        <form action="/login" method="post" className="w-full">
          <input type="hidden" name="return_to" value="/" />
          <Button
            type="submit"
            className="w-full bg-interactive text-text-inverse rounded-lg px-4 py-2 hover:bg-interactive-hover"
          >
            ログイン
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginView;

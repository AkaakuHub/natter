"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useHybridSPAAuth } from "@/core/auth/HybridSPAAuth";

const LoginView = () => {
  const { redirectAfterLogin } = useHybridSPAAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // URLのクエリパラメータからエラーを取得 - Next.js URLSearchParamsから直接取得
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");

    if (error) {
      switch (error) {
        case "OAuthSignin":
          setAuthError(
            "Twitter認証でエラーが発生しました。しばらく時間をあけて再度お試しください。",
          );
          break;
        case "OAuthCallback":
          setAuthError("Twitter認証のコールバックでエラーが発生しました。");
          break;
        case "OAuthCreateAccount":
          setAuthError("アカウント作成でエラーが発生しました。");
          break;
        case "EmailCreateAccount":
          setAuthError(
            "メールアドレスでのアカウント作成でエラーが発生しました。",
          );
          break;
        case "Callback":
          setAuthError("認証コールバックでエラーが発生しました。");
          break;
        case "OAuthAccountNotLinked":
          setAuthError("このアカウントは既に別の方法でリンクされています。");
          break;
        case "EmailSignin":
          setAuthError("メールサインインでエラーが発生しました。");
          break;
        case "CredentialsSignin":
          setAuthError("認証情報が正しくありません。");
          break;
        case "SessionRequired":
          setAuthError("セッションが必要です。ログインしてください。");
          break;
        default:
          setAuthError("認証エラーが発生しました。");
      }
    }
  }, []);

  const handleLogin = async () => {
    setAuthError(null);

    try {
      const result = await signIn("twitter", {
        callbackUrl: "/",
        redirect: false,
      });

      if (result?.error) {
        setAuthError(`認証エラー: ${result.error}`);
      } else if (result?.ok) {
        // SPAルーターでリダイレクト
        redirectAfterLogin();
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("認証処理中にエラーが発生しました。");
    }
  };

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
        <Button
          onClick={handleLogin}
          type="button"
          className="w-full bg-interactive text-text-inverse rounded-lg px-4 py-2 hover:bg-interactive-hover"
        >
          Twitterでログイン
        </Button>
      </div>
    </div>
  );
};

export default LoginView;

"use client";

import React, { useEffect, useState } from "react";
import { redirect, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import clsx from "clsx";

const LoginPage = () => {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [serverName, setServerName] = useState(
    process.env.NEXT_PUBLIC_BACKEND_URL || "",
  );
  const [serverKey, setServerKey] = useState(
    process.env.NEXT_PUBLIC_BACKEND_KEY || "",
  );
  const [isServerAvailable, setIsServerAvailable] = useState(true);
  const [isValidatingServer, setIsValidatingServer] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      redirect("/");
    }
  }, [session, status]);

  useEffect(() => {
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
  }, [error]);

  const getIsServerAvailable = async () => {
    const delay = async (ms: number) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    };

    let responseData = null;
    try {
      const response = await axios.post(
        `${serverName}/check-server`,
        { key: serverKey },
        { timeout: 3000 },
      );
      console.log("Server response:", response);
      if (response.status === 201 && response.data.token) {
        localStorage.setItem("jwt_token", response.data.token);
        responseData = response.data;
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      responseData = null;
    }

    await delay(3000);

    return responseData;
  };

  const handleLogin = async () => {
    setAuthError(null);
    setIsValidatingServer(true);
    const serverResponse = await getIsServerAvailable();
    setIsServerAvailable(!!serverResponse);
    setIsValidatingServer(false);
    if (!serverResponse) {
      return;
    }

    try {
      const result = await signIn("twitter", {
        callbackUrl: "/",
        redirect: false,
      });

      if (result?.error) {
        setAuthError(`認証エラー: ${result.error}`);
      } else if (result?.ok) {
        redirect("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("認証処理中にエラーが発生しました。");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center space-y-6 bg-white p-8 rounded-lg shadow-md">
        <Image src="/images/logo.png" alt="logo" width={128} height={128} />
        <Input
          type="text"
          placeholder="サーバー名を入力"
          value={serverName}
          onChange={(e) => setServerName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleLogin();
            }
          }}
          className="w-full"
        />
        <Input
          type="password"
          placeholder="サーバーkeyを入力"
          value={serverKey}
          onChange={(e) => setServerKey(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleLogin();
            }
          }}
          className="w-full"
        />
        {isServerAvailable === false && (
          <div className="text-red-500 text-sm">接続に失敗しました</div>
        )}
        {authError && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200">
            {authError}
          </div>
        )}
        <Button
          onClick={handleLogin}
          type="button"
          className={clsx(
            "w-full bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600",
            isValidatingServer && "bg-slate-300 hover:bg-slate-300",
          )}
          disabled={isValidatingServer || serverName === "" || serverKey === ""}
        >
          {isValidatingServer ? (
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
          ) : (
            "Twitterでログイン"
          )}
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;

"use client";

import React, { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import clsx from "clsx";

const LoginPage = () => {
  const { data: session, status } = useSession();
  const [serverName, setServerName] = useState("");
  const [serverKey, setServerKey] = useState("");
  const [isServerAvailable, setIsServerAvailable] = useState(true);
  const [isValidatingServer, setIsValidatingServer] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      redirect("/");
    }
  }, [session, status]);

  const getIsServerAvailable = async () => {
    const delay = async (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    };

    let responseStatus = false;
    try {
        const response = await axios.post(
            `http://${serverName}/check-server`,
            { key: serverKey },
            { timeout: 3000 }
        );
        responseStatus = response.status === 200;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        responseStatus = false;
    }

    await delay(3000);

    return responseStatus;
};


  const handleLogin = async () => {
    setIsValidatingServer(true);
    const isOK = await getIsServerAvailable();
    setIsServerAvailable(isOK);
    setIsValidatingServer(false);
    if (!isOK) {
      return;
    }
    const result = await signIn("twitter");
    if (result) {
      redirect("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center space-y-6 bg-white p-8 rounded-lg shadow-md">
        <Image src="/web-app-manifest-192x192.png" alt="logo" width={128} height={128} />
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
        <Button
          onClick={handleLogin}
          type="button"
          className={clsx("w-full bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600", isValidatingServer && "bg-slate-300 hover:bg-slate-300")}
          disabled={isValidatingServer || serverName === "" || serverKey === ""}
        >
          {
            isValidatingServer ? (
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            ) : "Twitterでログイン"
          }
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;

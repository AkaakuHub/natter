"use client";

import React from "react";
import { useEffect } from "react";

import { redirect } from "next/navigation";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";

import Image from "next/image";

const LoginPage = () => {
  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === "authenticated") {
      redirect("/");
    }
  }, [session, status]);

  const handleLogin = (provider: string) => async (event: React.MouseEvent) => {
    event.preventDefault();
    const result = await signIn(provider);

    if (result) {
      redirect("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Image src="/web-app-manifest-192x192.png" alt="logo" width={128} height={128} />
      <form className="w-full max-w-xs space-y-6 rounded bg-white p-8 shadow-md">
        <button
          onClick={handleLogin("twitter")}
          type="button"
          className="w-full bg-blue-500 text-white rounded-lg px-4 py-2"
        >
          Twitterでログイン
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
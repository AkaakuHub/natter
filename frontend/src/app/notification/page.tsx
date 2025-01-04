"use client";

import React from "react"
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import BaseLayout from "@/components/BaseLayout";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Notification() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status, router]);
  if (status === "loading") {
    return (
      <BaseLayout session={null}/>
    )
  }
  if (!session) {
    return null;
  }

  return (
    <BaseLayout session={session}>
      <div className="flex flex-col items-center justify-center h-screen gap-8">
        <div>
          このページは誠意開発中です。
        </div>
        <Button
          onClick={() => {
            redirect("/")
          }}
          type="button"
          className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
        >
          トップに戻る
        </Button>
      </div>
    </BaseLayout>

  )
}
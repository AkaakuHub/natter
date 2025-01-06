"use client";

import React from "react"
import { redirect } from "next/navigation";
import BaseLayout from "@/components/BaseLayout";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ExtendedSession } from "@/types";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status, router]);
  if (status === "loading") {
    return (
      <BaseLayout session={null}>
        ここがスケルトン
      </BaseLayout>
    )
  }
  if (!session) {
    return null;
  }

  return (
    <BaseLayout session={session as ExtendedSession}>
      <div className="flex flex-col items-center justify-center gap-8 bg-slate-700 h-full">
        <div>
          このページは誠意開発中です。ここはprofileページです。
        </div>

      </div>
    </BaseLayout>

  )
}
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import BaseLayout from "@/components/layout/BaseLayout";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";

export default function SetList() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center h-64">
          <div>Loading...</div>
        </div>
      </BaseLayout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <BaseLayout>
      <div className="flex flex-col items-center justify-center h-full gap-8 p-8">
        <div className="text-lg text-gray-600">
          このページは誠意開発中です。
        </div>
        <Button
          onClick={() => {
            router.push("/");
          }}
          type="button"
          className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
        >
          トップに戻る
        </Button>
      </div>
    </BaseLayout>
  );
}

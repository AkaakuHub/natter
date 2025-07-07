"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import BaseLayout from "@/components/layout/BaseLayout";

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
        <div className="text-lg text-text-secondary">
          このページは誠意開発中です。
        </div>
        <Button
          onClick={() => {
            router.push("/");
          }}
          type="button"
          className="bg-interactive text-text-inverse rounded-lg px-4 py-2 hover:bg-interactive-hover"
        >
          トップに戻る
        </Button>
      </div>
    </BaseLayout>
  );
}

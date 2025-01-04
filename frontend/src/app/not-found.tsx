"use client";

import React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-8">
      <h1 className="text-4xl">404 Not Found</h1>
      <Image src="/web-app-manifest-192x192.png" alt="logo" width={128} height={128} />
      <div>
        お探しのページは見つかりませんでした。
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
  )
}
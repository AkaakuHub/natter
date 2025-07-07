"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-8 bg-surface text-text">
      <h1 className="text-4xl">404 Not Found</h1>
      <Image
        src="/web-app-manifest-192x192.png"
        alt="logo"
        width={128}
        height={128}
      />
      <div>お探しのページは見つかりませんでした。</div>
      <Link
        href="/"
        type="button"
        className="bg-interactive text-text-inverse rounded-lg px-4 py-2 hover:bg-interactive-hover"
      >
        トップに戻る
      </Link>
    </div>
  );
}

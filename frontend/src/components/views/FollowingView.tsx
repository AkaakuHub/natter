"use client";

import React from "react";
import { useSession } from "next-auth/react";
import FollowList from "@/components/FollowList";
import { ExtendedSession } from "@/types";
import { usePathname } from "next/navigation";

const FollowingView = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div>Loading...</div>
      </div>
    );
  }

  // URL判定ロジック: /profile/:id/following の形式からuserIdを抽出
  let targetUserId: string | undefined;

  if (pathname?.match(/^\/profile\/[^/]+\/following$/)) {
    // フォロー中ページ (/profile/:id/following)
    const match = pathname.match(/^\/profile\/([^/]+)\/following$/);
    targetUserId = match?.[1];
  }

  if (!targetUserId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-error">User not found</div>
      </div>
    );
  }

  return (
    <FollowList
      userId={targetUserId}
      type="following"
      session={session as ExtendedSession | null}
    />
  );
};

export default FollowingView;

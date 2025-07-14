"use client";

import React from "react";
import { useSession } from "next-auth/react";
import FollowList from "@/components/FollowList";
import { ExtendedSession } from "@/types";
import { usePathname } from "next/navigation";

const FollowersView = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div>Loading...</div>
      </div>
    );
  }

  // URL判定ロジック: /profile/:id/followers の形式からuserIdを抽出
  let targetUserId: string | undefined;

  if (pathname?.match(/^\/profile\/[^/]+\/followers$/)) {
    // フォロワーページ (/profile/:id/followers)
    const match = pathname.match(/^\/profile\/([^/]+)\/followers$/);
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
      type="followers"
      session={session as ExtendedSession | null}
    />
  );
};

export default FollowersView;

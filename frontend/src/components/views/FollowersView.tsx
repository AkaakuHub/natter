"use client";

import React from "react";
import { useSession } from "next-auth/react";
import FollowList from "@/components/FollowList";
import { ExtendedSession } from "@/types";
import { useTrueSPARouter } from "@/core/router/TrueSPARouter";

const FollowersView = () => {
  const { currentRoute } = useTrueSPARouter();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div>Loading...</div>
      </div>
    );
  }

  // URL判定ロジック: /profile/followers の場合は自分、/profile/:id/followers の場合は他人
  let targetUserId: string | undefined;

  if (currentRoute?.path === "/profile/followers") {
    // 自分のフォロワーページ
    targetUserId = session?.user?.id;
  } else if (currentRoute?.path?.match(/^\/profile\/\d+\/followers$/)) {
    // 他人のフォロワーページ (/profile/:id/followers)
    targetUserId = currentRoute.params?.id;
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

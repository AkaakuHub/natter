"use client";

import React from "react";
import { useSession } from "next-auth/react";
import FollowList from "@/components/FollowList";
import { ExtendedSession } from "@/types";
import { useTrueSPARouter } from "@/core/router/TrueSPARouter";

const FollowingView = () => {
  const { currentRoute } = useTrueSPARouter();
  const { data: session, status } = useSession();

  console.log(
    "🔥 [FollowingView] Current route:",
    currentRoute?.path,
    "params:",
    currentRoute?.params,
  );

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div>Loading...</div>
      </div>
    );
  }

  // URL判定ロジック: /profile/following の場合は自分、/profile/:id/following の場合は他人
  let targetUserId: string | undefined;

  if (currentRoute?.path === "/profile/following") {
    // 自分のフォロー中ページ
    targetUserId = session?.user?.id;
    console.log(
      "🔥 [FollowingView] Own following page, user ID:",
      targetUserId,
    );
  } else if (currentRoute?.path?.match(/^\/profile\/\d+\/following$/)) {
    // 他人のフォロー中ページ (/profile/:id/following)
    targetUserId = currentRoute.params?.id;
    console.log(
      "🔥 [FollowingView] Other user following page, user ID:",
      targetUserId,
    );
  }

  console.log(
    "🔥 [FollowingView] Final target user ID:",
    targetUserId,
    "Session user ID:",
    session?.user?.id,
    "Current path:",
    currentRoute?.path,
  );

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

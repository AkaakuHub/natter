"use client";

import React from "react";
import { useSession } from "next-auth/react";
import FollowList from "@/components/FollowList";
import { ExtendedSession } from "@/types";
import { useTrueSPARouter } from "@/core/router/TrueSPARouter";

const FollowersView = () => {
  const { currentRoute } = useTrueSPARouter();
  const { data: session, status } = useSession();

  console.log(
    "🔥 [FollowersView] Current route:",
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

  // URL判定ロジック: /profile/followers の場合は自分、/profile/:id/followers の場合は他人
  let targetUserId: string | undefined;

  if (currentRoute?.path === "/profile/followers") {
    // 自分のフォロワーページ
    targetUserId = session?.user?.id;
    console.log(
      "🔥 [FollowersView] Own followers page, user ID:",
      targetUserId,
    );
  } else if (currentRoute?.path?.match(/^\/profile\/\d+\/followers$/)) {
    // 他人のフォロワーページ (/profile/:id/followers)
    targetUserId = currentRoute.params?.id;
    console.log(
      "🔥 [FollowersView] Other user followers page, user ID:",
      targetUserId,
    );
  }

  console.log(
    "🔥 [FollowersView] Final target user ID:",
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
      type="followers"
      session={session as ExtendedSession | null}
    />
  );
};

export default FollowersView;

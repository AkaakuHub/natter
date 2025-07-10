"use client";

import React from "react";
import { ExtendedSession } from "@/types";

interface FollowListProps {
  userId: string;
  type: "following" | "followers";
  session?: ExtendedSession | null;
}

const FollowList = ({ userId, type, session }: FollowListProps) => {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">
        {type === "following" ? "Following" : "Followers"}
      </h1>
      <div className="text-text-secondary">
        {type === "following" ? "フォロー中" : "フォロワー"}
        のリスト（ユーザーID: {userId}）
        {session && ` - セッション: ${session.user?.name}`}
      </div>
    </div>
  );
};

export default FollowList;

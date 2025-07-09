"use client";

import React from "react";
import { useSession } from "next-auth/react";
import FollowList from "@/components/FollowList";
import { ExtendedSession } from "@/types";

const MyFollowingPage = () => {
  const { data: session } = useSession();

  if (!session?.user?.id) {
    return (
      <div className="w-full max-w-md mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-text-muted">ログインが必要です</p>
        </div>
      </div>
    );
  }

  return (
    <FollowList
      userId={session.user.id}
      type="following"
      session={session as ExtendedSession}
    />
  );
};

export default MyFollowingPage;

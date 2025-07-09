"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import FollowList from "@/components/FollowList";
import { ExtendedSession } from "@/types";

const FollowersPage = () => {
  const params = useParams();
  const { data: session } = useSession();
  const userId = params.id as string;

  if (!session) {
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
      userId={userId}
      type="followers"
      session={session as ExtendedSession}
    />
  );
};

export default FollowersPage;

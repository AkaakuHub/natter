"use client";

import React from "react";
import { useSession } from "next-auth/react";
import BaseLayout from "@/components/layout/BaseLayout";
import FollowList from "@/components/FollowList";
import { ExtendedSession } from "@/types";

const MyFollowersPage = () => {
  const { data: session } = useSession();

  if (!session?.user?.id) {
    return (
      <BaseLayout>
        <div className="w-full max-w-md mx-auto p-4">
          <div className="text-center py-8">
            <p className="text-text-muted">ログインが必要です</p>
          </div>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <FollowList
        userId={session.user.id}
        type="followers"
        session={session as ExtendedSession}
      />
    </BaseLayout>
  );
};

export default MyFollowersPage;

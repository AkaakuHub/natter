"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import BaseLayout from "@/components/layout/BaseLayout";
import FollowList from "@/components/FollowList";
import { ExtendedSession } from "@/types";

const FollowingPage = () => {
  const params = useParams();
  const { data: session } = useSession();
  const userId = params.id as string;

  if (!session) {
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
        userId={userId}
        type="following"
        session={session as ExtendedSession}
      />
    </BaseLayout>
  );
};

export default FollowingPage;

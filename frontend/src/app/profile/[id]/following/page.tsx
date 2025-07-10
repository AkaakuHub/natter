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

  return (
    <BaseLayout>
      <FollowList
        userId={userId}
        type="following"
        session={session as ExtendedSession | null}
      />
    </BaseLayout>
  );
};

export default FollowingPage;

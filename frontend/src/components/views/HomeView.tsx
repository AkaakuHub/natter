"use client";

import React, { useState, useEffect } from "react";
import { useAuthSession } from "@/auth-client";
import TimeLine from "@/components/TimeLine";
import { User } from "@/api";
import SkeletonLoading from "@/components/common/SkeletonLoading";

const HomeView = () => {
  const { data: session, status } = useAuthSession();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (session?.user) {
      const user: User = {
        id: session.user.id as string,
        name: session.user.name || "Unknown User",
        image: session.user.image || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCurrentUser(user);
    } else {
      setCurrentUser(null);
    }
  }, [session]);

  // 認証チェック中はローディング表示
  if (status === "loading") {
    return <SkeletonLoading />;
  }

  // 未認証の場合は何も表示しない（HybridSPAAuthがリダイレクトを処理）
  if (status === "unauthenticated") {
    return null;
  }

  return <TimeLine currentUser={currentUser} />;
};

export default HomeView;

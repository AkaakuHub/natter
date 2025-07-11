"use client";

import React from "react";
import { useSession } from "next-auth/react";
import ProfileComponent from "@/components/Profile";
import { ExtendedSession } from "@/types";
import { useTrueSPARouter } from "@/core/router/TrueSPARouter";

const ProfileView = () => {
  const { currentRoute } = useTrueSPARouter();
  const { data: session, status } = useSession();

  const userId = currentRoute?.params.id;

  console.log("🚨 [PROFILE VIEW] Component mounted!");
  console.log("🚨 [PROFILE VIEW] Current route:", currentRoute);
  console.log("🚨 [PROFILE VIEW] User ID:", userId);
  console.log("🚨 [PROFILE VIEW] Route params:", currentRoute?.params);
  console.log("🚨 [PROFILE VIEW] Route path:", currentRoute?.path);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div>Loading...</div>
      </div>
    );
  }

  // プロフィール画面のリダイレクト処理
  if (!userId && session?.user?.id) {
    // 自分のプロフィールページの場合、IDを設定
    return (
      <ProfileComponent
        session={session as ExtendedSession | null}
        userId={session.user.id}
      />
    );
  }

  return (
    <ProfileComponent
      session={session as ExtendedSession | null}
      userId={userId}
    />
  );
};

export default ProfileView;

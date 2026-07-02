"use client";

import React from "react";
import { useAuthSession } from "@/auth-client";
import ProfileComponent from "@/components/Profile";
import { ExtendedSession } from "@/types";
import { usePathname } from "next/navigation";

const ProfileView = () => {
  const pathname = usePathname();
  const { data: session, status } = useAuthSession();

  // パスから userId を抽出: /profile/:id の形式
  const userId =
    pathname === "/profile"
      ? undefined
      : pathname.match(/^\/profile\/([^/]+)$/)?.[1];

  // Post IDが間違ってuserIdとして使用されることを防ぐ
  if (userId && !isNaN(Number(userId)) && Number(userId) < 10000) {
    console.warn(
      "🚨 [PROFILE VIEW] BLOCKED: userId looks like a Post ID:",
      userId,
    );
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-error">Invalid Profile ID</div>
      </div>
    );
  }

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

"use client";

import React from "react";
import { useSession } from "next-auth/react";
import DetailedPostComponent from "@/components/DetailedPost";
import { usePathname } from "next/navigation";

const PostView = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // パスから postId を抽出: /post/:id の形式
  const postId = pathname.match(/^\/post\/([^/]+)$/)?.[1];

  // セッションから直接ユーザー情報を取得
  const currentUser =
    session?.user && session.user.id
      ? {
          id: session.user.id,
          name: session.user.name || "",
          image: session.user.image || undefined,
          twitterId: session.user.id,
          createdAt: "",
          updatedAt: "",
        }
      : null;

  if (
    !postId ||
    isNaN(Number(postId)) ||
    !Number.isSafeInteger(Number(postId))
  ) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-error">Invalid Post ID</div>
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

  return <DetailedPostComponent postId={postId} currentUser={currentUser} />;
};

export default PostView;

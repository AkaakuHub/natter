"use client";

import React, { useEffect } from "react";
import { redirect, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import BaseLayout from "@/components/layout/BaseLayout";
import DetailedPostComponent from "@/components/DetailedPost";

const Post = () => {
  const params = useParams<{ id: string }>();
  const postId = params.id;
  const { data: session, status } = useSession();

  // セッションから直接ユーザー情報を取得（タイムラインと同じ方式）
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

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status]);

  if (isNaN(parseInt(postId))) {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-error">Invalid Post ID</div>
        </div>
      </BaseLayout>
    );
  }

  if (status === "loading") {
    return (
      <BaseLayout>
        <div className="flex items-center justify-center h-64">
          <div>Loading...</div>
        </div>
      </BaseLayout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <BaseLayout>
      <DetailedPostComponent postId={postId} currentUser={currentUser} />
    </BaseLayout>
  );
};

export default Post;

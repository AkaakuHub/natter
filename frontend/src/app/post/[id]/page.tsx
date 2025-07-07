"use client";

import React, { useEffect } from "react";
import { redirect, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import BaseLayout from "@/components/layout/BaseLayout";
import DetailedPostComponent from "@/components/DetailedPost";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const Post = () => {
  const params = useParams<{ id: string }>();
  const postId = params.id;
  const { data: session, status } = useSession();
  const { currentUser } = useCurrentUser();

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

"use client";

import React, { useEffect } from "react";
import { redirect, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import SimpleLayout from "@/components/layout/SimpleLayout";
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
      <SimpleLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Invalid Post ID</div>
        </div>
      </SimpleLayout>
    );
  }

  if (status === "loading") {
    return (
      <SimpleLayout>
        <div className="flex items-center justify-center h-64">
          <div>Loading...</div>
        </div>
      </SimpleLayout>
    );
  }

  if (!session) {
    return null;
  }

  return <DetailedPostComponent postId={postId} currentUser={currentUser} />;
};

export default Post;

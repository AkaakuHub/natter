"use client";

import React, { useEffect } from "react";
import { redirect, useParams, useRouter } from 'next/navigation'
import { useSession } from "next-auth/react";
import BaseLayout from "@/components/layout/BaseLayout";
import { ExtendedSession } from "@/types";

import DetailedPostComponent from "@/components/DetailedPost";

const Post = () => {
  const params = useParams<{ id: string }>();
  const postId = params.id;
  if (isNaN(parseInt(postId))) {
    return <div>Invalid ID</div>;
  }

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <BaseLayout session={null}>
        ここがスケルトン
      </BaseLayout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <DetailedPostComponent session={session as ExtendedSession} postId={postId} />
  )
}

export default Post;

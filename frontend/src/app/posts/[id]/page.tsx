"use client";

import React from "react";
import { useParams } from 'next/navigation'

const Post = () => {
  const params = useParams<{ id: string }>();
  const postId = params.id;
  if (isNaN(parseInt(postId))) {
    return <div>Invalid ID</div>;
  }

  return <div>Post ID: {postId}</div>;
}

export default Post;
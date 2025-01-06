"use client";

import React from "react";

const Post = ({params} : {params: {id: string}}) => {
  const postId = params.id;
  if (isNaN(parseInt(postId))) {
    return <div>Invalid ID</div>;
  }

  return <div>Post ID: {postId}</div>;
}

export default Post;
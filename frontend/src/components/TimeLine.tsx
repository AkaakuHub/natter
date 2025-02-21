"use client";

import React from "react";
import { ExtendedSession } from "@/types";
import PostComponent from "./PostComponent";

// 後ほど使うかも
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TimeLine = () => {
  // モックデータ
  const mockData = {
    posts: [
      {
        id: 5100001,
        userId: 100001,
        content: "this is a test post",
        images: ["/web-app-manifest-512x512.png"],
        createdAt: "2025-01-01T00:00:00",
        liked: [100001, 100002],
      },
      {
        id: 5100002,
        userId: 100002,
        content: "this is a test post 2",
        createdAt: "2025-01-01T01:00:00",
      },
      {
        id: 5100003,
        userId: 100003,
        content: "this is a test post 3",
        createdAt: "2025-01-01T02:00:00",
        liked: [100001, 100003],
      },
      {
        id: 5100004,
        userId: 100001,
        content: "this is a test post 4",
        images: [
          "/web-app-manifest-512x512.png",
          "/web-app-manifest-512x512.png",
        ],
        createdAt: "2025-01-01T04:00:00",
      },
    ],
    users: [
      {
        id: 100001,
        name: "test user 1",
        image: "/no_avatar_image_128x128.png",
      },
      {
        id: 100002,
        name: "test user 2",
        image: "/no_avatar_image_128x128.png",
      },
      {
        id: 100003,
        name: "test user 3",
        image: "/no_avatar_image_128x128.png",
      },
    ],
  };

  const getUserById = (userId: number) => mockData.users.find(user => user.id === userId);

  return (
    <div className="w-full max-w-md mx-auto">
      {mockData.posts.map(post => {
        const user = getUserById(post.userId);
        return user && post ? (
          <PostComponent key={post.id} user={user} post={post} />
        ) : null;
      })}
    </div>
  );
};

export default TimeLine;

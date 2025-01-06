"use client";

import React, { useEffect } from "react";
import { redirect, useParams, useRouter } from 'next/navigation'
import { useSession } from "next-auth/react";
import BaseLayout from "@/components/layout/BaseLayout";
import { ExtendedSession } from "@/types";
import Image from "next/image";

import { IconHeart, IconMessageCircle, IconShare } from "@tabler/icons-react";


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

  const post = mockData.posts.find((p) => p.id === parseInt(postId));
  if (!post) {
    return <div>Post not found</div>;
  }
  const user = mockData.users.find((u) => u.id === post.userId);

  return (
     <BaseLayout session={session as ExtendedSession}>
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <div className="flex items-start space-x-4 border-b pb-4">
        <Image
          src={user?.image || "/no_avatar_image_128x128.png"}
          alt={`${user?.name}'s avatar`}
          width={48}
          height={48}
          className="rounded-full"
        />
        <div>
          <h1 className="font-bold text-lg text-gray-900">{user?.name}</h1>
          <p className="text-gray-500 text-sm">
            @{user?.name.toLowerCase().replace(/\s+/g, "_")}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xl text-gray-800">{post.content}</p>
        {post.images && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {post.images.map((image, idx) => (
              <Image
                key={idx}
                src={image}
                alt={`Post image ${idx + 1}`}
                width={512}
                height={512}
                className="rounded-lg w-full h-auto object-cover"
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-500 border-b pb-4">
        <p>Posted on: {new Date(post.createdAt).toLocaleString()}</p>
        <p>Likes: {post.liked?.length || 0}</p>
      </div>

      <div className="flex items-center gap-8 mt-2 text-gray-500">
        <button className="flex items-center gap-1 hover:text-red-500 w-[calc(100% / 3)] justify-center">
          <IconHeart size={20} />
          <span>10</span>
        </button>
        <button className="flex items-center gap-1 hover:text-blue-500 w-[calc(100% / 3)] justify-center">
          <IconMessageCircle size={20} />
          <span>20</span>
        </button>
        <button className="flex items-center gap-1 hover:text-green-500 w-[calc(100% / 3)] justify-center">
          <IconShare size={20} />
        </button>
      </div>
    </div>
    </BaseLayout>
  );
}

export default Post;
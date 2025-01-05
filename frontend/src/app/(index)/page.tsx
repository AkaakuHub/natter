"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import BaseLayout from "@/components/BaseLayout";
import { useRouter, redirect } from "next/navigation";
import { IconHeart, IconMessageCircle, IconShare } from "@tabler/icons-react";
import { ExtendedSession } from "@/types";
import Image from "next/image";
import Link from "next/link";

const Home = () => {
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
    <BaseLayout session={session as ExtendedSession}>
      <div className="w-full max-w-md mx-auto mt-4">
        {mockData.posts.map(post => {
          const user = getUserById(post.userId);
          return (
            <Link
              href={`/posts/${user?.id}`}
              key={post.id}
            >
              <div
                className="border-b border-gray-200 py-4 px-4 flex gap-4"
              >
                <Image
                  src={user?.image || "no_avatar_image_128x128.png"}
                  alt={user?.name || "User"}
                  className="w-12 h-12 rounded-full"
                  width={48}
                  height={48}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold">
                        {user?.name || "Unknown User"}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        @{user?.id || "unknown"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-800">{post.content}</p>
                  {post.images && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {post.images.map((image, index) => (
                        <Image
                          key={index}
                          src={image}
                          alt="Post Image"
                          className="w-full h-auto rounded-md"
                          width={200}
                          height={200}
                        />
                      ))}
                    </div>
                  )}
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
              </div>
            </Link>
          );
        })}
      </div>
    </BaseLayout>
  );
};

export default Home;

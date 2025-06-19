"use client";

import React, { useState, useEffect } from "react";
import BaseLayout from "@/components/layout/BaseLayout";
import { ExtendedSession } from "@/types";
import Image from "next/image";
import { IconHeart, IconMessageCircle, IconShare } from "@tabler/icons-react";
import { PostsApi, Post, User } from "@/api";

interface DetailedPostComponentProps {
  session: ExtendedSession;
  postId: string;
}

const DetailedPostComponent = ({ session, postId }: DetailedPostComponentProps) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const fetchedPost = await PostsApi.getPostById(parseInt(postId));
        setPost(fetchedPost);
      } catch (err) {
        console.error('Failed to fetch post:', err);
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <BaseLayout session={session}>
        <div className="max-w-2xl mx-auto mt-10 px-4 flex justify-center">
          <div className="text-gray-500">Loading post...</div>
        </div>
      </BaseLayout>
    );
  }

  if (error || !post) {
    return (
      <BaseLayout session={session}>
        <div className="max-w-2xl mx-auto mt-10 px-4 flex justify-center">
          <div className="text-red-500">{error || "Post not found"}</div>
        </div>
      </BaseLayout>
    );
  }

  const user = post.author;

  return (
    <BaseLayout session={session}>
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
          {post.images && post.images.length > 0 && (
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
          <p>Likes: {post._count?.likes || 0}</p>
        </div>

        <div className="flex items-center gap-8 mt-2 text-gray-500">
          <button className="flex items-center gap-1 hover:text-red-500 w-[calc(100% / 3)] justify-center">
            <IconHeart size={20} />
            <span>{post._count?.likes || 0}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-blue-500 w-[calc(100% / 3)] justify-center">
            <IconMessageCircle size={20} />
            <span>0</span>
          </button>
          <button className="flex items-center gap-1 hover:text-green-500 w-[calc(100% / 3)] justify-center">
            <IconShare size={20} />
          </button>
        </div>
      </div>
    </BaseLayout>
  );
};

export default DetailedPostComponent;
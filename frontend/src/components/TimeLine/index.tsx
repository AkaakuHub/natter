"use client";

import React, { useState, useEffect } from "react";
import PostComponent from "../Post";
import CreatePost from "../CreatePost";
import { PostsApi, Post, User } from "../../api";
import { ExtendedSession } from "@/types";

interface TimeLineProps {
  session?: ExtendedSession;
  currentUser?: User | null;
}

const TimeLine = ({ currentUser }: TimeLineProps) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await PostsApi.getAllPosts();
      setPosts(fetchedPosts);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = () => {
    // 新しい投稿が作成されたら投稿一覧を再取得
    fetchPosts();
  };

  // currentUserはpropsから受け取る

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto flex justify-center py-8">
        <div className="text-gray-500">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto flex justify-center py-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* ポスト作成エリア */}
      {currentUser && (
        <CreatePost
          currentUser={currentUser}
          onPostCreated={handlePostCreated}
        />
      )}

      {/* 投稿一覧 */}
      {posts.map((post) => {
        if (!post.author) {
          return null;
        }

        // Convert API data format to component format
        const user: User = post.author;
        const transformedUser = {
          ...user,
          image: user.image || "no_avatar_image_128x128.png",
        };
        const transformedPost = {
          id: post.id,
          userId: post.authorId || "",
          content: post.content || "",
          images: post.images || [],
          createdAt: post.createdAt,
          liked: post.likes?.map((like) => like.userId) || [],
          _count: post._count,
          replyTo: post.replyTo
            ? {
                id: post.replyTo.id,
                content: post.replyTo.content || "",
                author: {
                  id: post.replyTo.author?.id || "",
                  name: post.replyTo.author?.name || "",
                },
              }
            : undefined,
        };

        return (
          <PostComponent
            key={post.id}
            user={transformedUser}
            post={transformedPost}
          />
        );
      })}
    </div>
  );
};

export default TimeLine;

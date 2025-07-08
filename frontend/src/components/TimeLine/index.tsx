"use client";

import React, { useState, useEffect } from "react";
import PostComponent from "../Post";
import CreatePostButton from "../CreatePostButton";
import { PostsApi, Post, User } from "../../api";
import { transformPostToPostComponent } from "@/utils/postTransformers";
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

  const handlePostUpdate = () => {
    // usePostActionsで楽観的更新済みのため、再取得は不要
    // fetchPosts();
  };

  const handlePostDelete = (postId: number) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
  };

  // グローバルな投稿作成イベントを監視
  useEffect(() => {
    const handleGlobalPostCreated = () => {
      fetchPosts();
    };

    window.addEventListener("postCreated", handleGlobalPostCreated);
    return () => {
      window.removeEventListener("postCreated", handleGlobalPostCreated);
    };
  }, []);

  // currentUserはpropsから受け取る

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto flex justify-center py-8">
        <div className="text-text-muted">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto flex justify-center py-8">
        <div className="text-error">{error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-md mx-auto">
        {/* 投稿一覧 */}
        {posts.map((post) => {
          const transformed = transformPostToPostComponent(post);
          if (!transformed) return null;

          const { transformedUser, transformedPost } = transformed;

          return (
            <PostComponent
              key={post.id}
              user={transformedUser}
              post={transformedPost}
              currentUser={currentUser}
              onPostUpdate={handlePostUpdate}
              onPostDelete={() => handlePostDelete(post.id)}
            />
          );
        })}
      </div>

      {/* 投稿作成ボタン */}
      <CreatePostButton
        onClick={() => {
          // nキーと同じ動作をトリガー
          const event = new KeyboardEvent("keydown", { key: "n" });
          document.dispatchEvent(event);
        }}
      />
    </>
  );
};

export default TimeLine;

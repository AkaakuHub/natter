"use client";

import React, { useState, useEffect } from "react";
import PostComponent from "../Post";
import CreatePost from "../CreatePost";
import { PostsApi, Post, User } from "../../api";

const TimeLine = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await PostsApi.getAllPosts();
      setPosts(fetchedPosts);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load posts');
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

  // 仮のユーザー情報（実際のアプリでは認証されたユーザー情報を使用）
  const currentUser = {
    id: 1,
    name: "Alice",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  };

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
      <CreatePost 
        currentUser={currentUser}
        onPostCreated={handlePostCreated}
      />
      
      {/* 投稿一覧 */}
      {posts.map(post => {
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
          userId: post.authorId || 0,
          content: post.content || '',
          images: post.images || [],
          createdAt: post.createdAt,
          liked: post.likes?.map(like => like.userId) || [],
        };
        
        return (
          <PostComponent key={post.id} user={transformedUser} post={transformedPost} />
        );
      })}
    </div>
  );
};

export default TimeLine;

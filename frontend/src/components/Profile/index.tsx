"use client";

import React, { useState, useEffect, useRef } from "react";

import PostComponent from "@/components/Post";

import { PostsApi, Post } from "@/api";
import ProfileHeader from "./ProfileHeader";
import TabsComponent, { TabType, TabNames } from "./TabsComponent";
import { transformPostToPostComponent } from "@/utils/postTransformers";

import { ExtendedSession } from "@/types";

interface ProfileComponentProps {
  session: ExtendedSession;
  userId?: string;
}

const ProfileComponent = ({ session, userId }: ProfileComponentProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("tweets");

  // セッションから currentUser を作成（タイムラインと同じ方式）
  const currentUser =
    session?.user && session.user.id
      ? {
          id: session.user.id,
          name: session.user.name || "",
          image: session.user.image || undefined,
          twitterId: session.user.id,
          createdAt: "",
          updatedAt: "",
        }
      : null;
  const [posts, setPosts] = useState<Post[]>([]);
  const [mediaPosts, setMediaPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastTargetUserIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const fetchUserPosts = async () => {
      const targetUserId = userId || session.user?.id;
      if (!targetUserId) return;

      // 同じユーザーIDの場合は再実行しない
      if (lastTargetUserIdRef.current === targetUserId) {
        return;
      }

      lastTargetUserIdRef.current = targetUserId;

      try {
        setLoading(true);
        setError(null);
        const [userPosts, userMediaPosts, userLikedPosts] = await Promise.all([
          PostsApi.getPostsByUser(targetUserId),
          PostsApi.getMediaPosts(),
          PostsApi.getLikedPosts(targetUserId),
        ]);

        setPosts(userPosts);
        setMediaPosts(
          userMediaPosts.filter((post) => post.authorId === targetUserId),
        );
        setLikedPosts(userLikedPosts);
      } catch (err) {
        console.error("Failed to fetch user posts:", err);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [session.user?.id, userId]);

  const handleTabChange = (tab: TabType) => setActiveTab(tab);

  // 投稿更新用のコールバック
  const handlePostUpdate = () => {
    // プロフィールページでは楽観的更新済みのため、再取得は不要
    // 必要に応じて個別タブの再取得を実装可能
  };

  const handlePostDelete = (postId: number) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    setMediaPosts((prevPosts) =>
      prevPosts.filter((post) => post.id !== postId),
    );
    setLikedPosts((prevPosts) =>
      prevPosts.filter((post) => post.id !== postId),
    );
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-surface text-text">
        <ProfileHeader session={session} userId={userId} />
        <TabsComponent activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="flex justify-center py-8">
          <div className="text-text-muted">Loading posts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-surface text-text">
        <ProfileHeader session={session} userId={userId} />
        <TabsComponent activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="flex justify-center py-8">
          <div className="text-error">{error}</div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    const currentPosts =
      activeTab === "tweets"
        ? posts
        : activeTab === "media"
          ? mediaPosts
          : likedPosts;

    if (loading) {
      return <div className="text-center py-8">Loading...</div>;
    }

    if (error) {
      return <div className="text-center py-8 text-error">{error}</div>;
    }

    if (currentPosts.length === 0) {
      return (
        <div className="text-center py-8">
          まだ{TabNames[activeTab]}はありません
        </div>
      );
    }

    return currentPosts.map((post) => {
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
    });
  };

  return (
    <div className="w-full h-full bg-surface text-text">
      <ProfileHeader session={session} userId={userId} />
      <TabsComponent activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="overflow-y-auto h-[calc(100dvh-60px)] w-full">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProfileComponent;

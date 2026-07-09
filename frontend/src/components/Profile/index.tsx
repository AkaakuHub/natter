"use client";

import React, { useState, useEffect, useRef } from "react";

import PostComponent from "@/components/Post";
import SkeletonCard from "@/components/common/SkeletonCard";
import CharacterList from "@/components/CharacterList";

import { PostsApi, Post } from "@/api";
import { useCharacters } from "@/hooks/queries/useCharacters";
import ProfileHeader from "./ProfileHeader";
import TabsComponent, { TabType, TabNames } from "./TabsComponent";
import { profileTabCounts } from "@/domain/profile/profileTabCounts";
import { transformPostToPostComponent } from "@/domain/posts/postTransformers";

import { ExtendedSession } from "@/types";

interface ProfileComponentProps {
  session: ExtendedSession | null;
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
          userId: session.user.id,
          createdAt: "",
          updatedAt: "",
        }
      : null;

  // 自分のプロフィールかどうかを判定
  const isOwnProfile = !userId || userId === session?.user?.id;
  const [posts, setPosts] = useState<Post[]>([]);
  const [mediaPosts, setMediaPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastTargetUserIdRef = useRef<string | undefined>(undefined);
  const targetUserId = userId || session?.user?.id;
  const { data: characters = [] } = useCharacters(targetUserId);
  const tabCounts = profileTabCounts({
    posts,
    mediaPosts,
    likedPosts,
    characters,
  });

  useEffect(() => {
    const fetchUserPosts = async () => {
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
        setLikedPosts(userLikedPosts.filter((post) => !post.deletedAt));
      } catch (err) {
        console.error("Failed to fetch user posts:", err);
        setError("Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [targetUserId]);

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
      <div className="flex min-h-full w-full flex-col bg-surface text-text">
        <ProfileHeader session={session} userId={userId} isCompact={false} />
        <TabsComponent
          activeTab={activeTab}
          onTabChange={handleTabChange}
          counts={tabCounts}
        />
        <div className="w-full">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-full w-full flex-col bg-surface text-text">
        <ProfileHeader session={session} userId={userId} isCompact={false} />
        <TabsComponent
          activeTab={activeTab}
          onTabChange={handleTabChange}
          counts={tabCounts}
        />
        <div className="flex justify-center py-8">
          <div className="text-error">{error}</div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    // キャラクタータブの場合は専用コンポーネントを返す
    if (activeTab === "characters") {
      return <CharacterList userId={userId} isOwnProfile={isOwnProfile} />;
    }

    const currentPosts =
      activeTab === "tweets"
        ? posts
        : activeTab === "media"
          ? mediaPosts
          : likedPosts;

    if (loading) {
      return (
        <div className="w-full">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      );
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
    <div className="flex min-h-full w-full flex-col bg-surface text-text">
      <ProfileHeader session={session} userId={userId} isCompact={false} />
      <TabsComponent
        activeTab={activeTab}
        onTabChange={handleTabChange}
        counts={tabCounts}
      />
      <div className="w-full flex-1 bg-surface">{renderTabContent()}</div>
    </div>
  );
};

export default ProfileComponent;

"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import PostComponent from "@/components/Post";

import { PostsApi, Post, User } from "@/api";
import ProfileHeader from "./ProfileHeader";
import TabsComponent, { TabType, TabKinds, TabNames } from "./TabsComponent";

import { ExtendedSession } from "@/types";

interface ProfileComponentProps {
  session: ExtendedSession;
  userId?: string;
}

const ProfileComponent = ({ session, userId }: ProfileComponentProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("tweets");
  const [posts, setPosts] = useState<Post[]>([]);
  const [mediaPosts, setMediaPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      const targetUserId = userId || session.user?.id;
      if (!targetUserId) return;
      
      try {
        setLoading(true);
        const [userPosts, userMediaPosts, userLikedPosts] = await Promise.all([
          PostsApi.getPostsByUser(targetUserId),
          PostsApi.getMediaPosts(),
          PostsApi.getLikedPosts(targetUserId),
        ]);
        
        setPosts(userPosts);
        setMediaPosts(userMediaPosts.filter(post => post.authorId === targetUserId));
        setLikedPosts(userLikedPosts);
      } catch (err) {
        console.error('Failed to fetch user posts:', err);
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [session.user?.id, userId]);

  

  const handleTabChange = (tab: TabType) => setActiveTab(tab);

  if (loading) {
    return (
      <div className="w-full h-full bg-white text-black">
        <ProfileHeader session={session} userId={userId} />
        <TabsComponent activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Loading posts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-white text-black">
        <ProfileHeader session={session} userId={userId} />
        <TabsComponent activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="flex justify-center py-8">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white text-black">
      <ProfileHeader session={session} userId={userId} />
      <TabsComponent activeTab={activeTab} onTabChange={handleTabChange} />
      <Swiper
        onSlideChange={(swiper) => handleTabChange(TabKinds[swiper.activeIndex])}
        onSwiper={(swiper) => swiper.slideTo(TabKinds.indexOf(activeTab))}
        className="h-full"
      >
        {TabKinds.map((tab) => (
          <SwiperSlide key={tab}>
            <div className="overflow-y-auto h-[calc(100dvh-60px)] w-full">
              {(() => {
                const currentPosts = tab === "tweets" ? posts : tab === "media" ? mediaPosts : likedPosts;
                
                if (currentPosts.length === 0) {
                  return <div className="text-center py-8">まだ{TabNames[tab]}はありません</div>;
                }
                
                return currentPosts.map((post) => {
                  if (!post.author) return null;
                  
                  const user: User = post.author;
                  const transformedUser = {
                    ...user,
                    image: user.image || "no_avatar_image_128x128.png",
                  };
                  const transformedPost = {
                    id: post.id,
                    userId: post.authorId || "",
                    content: post.content || '',
                    images: post.images || [],
                    createdAt: post.createdAt,
                    liked: post.likes?.map(like => like.userId) || [],
                  };
                  
                  return <PostComponent key={post.id} user={transformedUser} post={transformedPost} />;
                });
              })()}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProfileComponent;
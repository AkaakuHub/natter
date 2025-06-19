"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import PostComponent from "@/components/Post";
import { ExtendedSession } from "@/types";
import { mockPosts, getUserById } from "@/data/mockData";
import ProfileHeader from "./ProfileHeader";
import TabsComponent, { TabType, TabKinds, TabNames } from "./TabsComponent";

interface ProfileComponentProps {
  session: ExtendedSession;
}

const ProfileComponent = ({ session }: ProfileComponentProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("tweets");

  const filteredPosts =
    activeTab === "tweets"
      ? mockPosts
      : activeTab === "media"
        ? mockPosts.filter((post) => post.images)
        : mockPosts.filter((post) => post.liked === session.user?.id);

  const handleTabChange = (tab: TabType) => setActiveTab(tab);

  return (
    <div className="w-full h-full bg-white text-black">
      <ProfileHeader session={session} />
      <TabsComponent activeTab={activeTab} onTabChange={handleTabChange} />
      <Swiper
        onSlideChange={(swiper) => handleTabChange(TabKinds[swiper.activeIndex])}
        onSwiper={(swiper) => swiper.slideTo(TabKinds.indexOf(activeTab))}
        className="h-full"
      >
        {TabKinds.map((tab) => (
          <SwiperSlide key={tab}>
            <div className="overflow-y-auto h-[calc(100dvh-60px)] w-full">
              {filteredPosts.length ? (
                filteredPosts.map((post) => {
                  const user = getUserById(post.userId);
                  return user && <PostComponent key={post.id} user={user} post={post} />;
                })
              ) : (
                <div className="text-center">まだ{TabNames[tab]}はありません</div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProfileComponent;
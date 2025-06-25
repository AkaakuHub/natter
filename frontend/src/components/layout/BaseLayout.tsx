"use client";

import React from "react";
import { Swiper as SwiperComponent, SwiperSlide } from "swiper/react";
import type { Swiper } from "swiper";
import "swiper/css";
import clsx from "clsx";

import SideBar from "@/components/SideBar";
import { FooterMenu } from "../FooterMenu";
import TimeLine from "../TimeLine";
import ProfileComponent from "../Profile";
import DetailedPostComponent from "../DetailedPost";
import Header from "./Header";
import { useSwiper } from "./hooks/useSwiper";
import { useNavigation } from "./hooks/useNavigation";

import { useSearchParams } from "next/navigation";
import { UsersApi } from "@/api/users";
import Welcome from "../Welcome";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const BaseLayoutInner = ({ children }: { children: React.ReactNode }) => {
  const { session, userExists, isLoading, createUserAndRefresh } = useCurrentUser();
  const { setSwiperInstance, progress, profileOnClick, mainSlideOnClick, setupSlideChangeHandler } = useSwiper();
  const { path, prevPath, postIdFromHistory, handleBackNavigation } = useNavigation();
  const searchParams = useSearchParams();
  const [targetUser, setTargetUser] = React.useState<{ image?: string } | null>(null);

  // Get the userId from URL params to determine if viewing another user's profile
  const viewingUserId = searchParams.get('userId');

  React.useEffect(() => {
    if (viewingUserId) {
      UsersApi.getUserById(viewingUserId)
        .then(user => setTargetUser(user))
        .catch(() => setTargetUser(null));
    } else {
      setTargetUser(null);
    }
  }, [viewingUserId]);

  const headerProfileImage = (path === 'profile' && targetUser?.image) ? targetUser.image : (session?.user?.image ?? "no_avatar_image_128x128.png");


  React.useEffect(() => {
    setupSlideChangeHandler(handleBackNavigation);
  }, [setupSlideChangeHandler, handleBackNavigation]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="w-full h-screen">
        <Header progress={1} />
        {children}
        <FooterMenu path={path} />
      </div>
    );
  }

  // 新規ユーザーの場合はWelcomeコンポーネントを表示
  if (userExists === false && session) {
    return (
      <Welcome 
        session={session} 
        onUserCreated={createUserAndRefresh} 
      />
    );
  }

  const componentDict: { [key: string]: React.ReactNode } = {
    "profile": <ProfileComponent session={session} />,
    "": <TimeLine />,
    "post": <DetailedPostComponent postId={postIdFromHistory} />,
  };

  if (prevPath !== null) {
    return (
      <div className="w-full h-full relative">
        <div className="fixed top-0 left-0 w-full h-screen z-0"
          style={{
            transform: `translateX(${-progress * 100}px)`,
          }}
        >
          {prevPath !== "profile" && (
            <Header
              profileImage={headerProfileImage}
              profileOnClick={profileOnClick}
              progress={1 - progress}
            />
          )}
          <div className="overflow-y-auto h-[calc(100dvh-64px-60px)] w-full">
            {componentDict[prevPath]}
          </div>
          <div
            className="inset-0 bg-slate-600 pointer-events-none w-full h-screen fixed"
            style={{ opacity: progress * 0.5 }}
          />
        </div>
        <SwiperComponent
          slidesPerView={1}
          initialSlide={1}
          speed={300}
          resistance={true}
          resistanceRatio={0}
          onSwiper={(swiper: Swiper) => setSwiperInstance(swiper)}
        >
          <SwiperSlide onClick={profileOnClick}>
            <div className="fixed top-0 left-0 w-full h-screen">
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="w-full h-screen z-10 bg-white">
              <div className="overflow-y-auto h-[calc(100dvh-60px)] w-full">
                {children}
              </div>
            </div>
          </SwiperSlide>
        </SwiperComponent>
        <FooterMenu path={path} />
      </div>
    );
  } else {
    return (
      <div className="w-full h-full relative">
        <SwiperComponent
          spaceBetween={-100}
          slidesPerView={1}
          initialSlide={1}
          speed={300}
          resistance={true}
          resistanceRatio={0}
          onSwiper={(swiper: Swiper) => setSwiperInstance(swiper)}
        >
          <SwiperSlide>
            <div className="relative w-[calc(100vw-100px)] h-screen">
              <SideBar session={session} />
            </div>
          </SwiperSlide>
          <SwiperSlide onClick={mainSlideOnClick}>
            <div className="w-full h-screen">
              {path !== "profile" && (
                <Header
                  profileImage={headerProfileImage}
                  profileOnClick={profileOnClick}
                  progress={progress}
                />
              )}
              <div className="overflow-y-auto h-[calc(100dvh-64px-60px)] w-full relative">
                {children}
              </div>
              <FooterMenu path={path} />
              <div
                className={clsx("fixed inset-0 bg-slate-600 pointer-events-none w-full h-screen z-10", progress < 1 && "pointer-events-auto")}
                style={{ opacity: 0.5 - progress * 0.5 }}
              />
            </div>
          </SwiperSlide>
        </SwiperComponent>
      </div>
    );
  }
};

const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <BaseLayoutInner>
      {children}
    </BaseLayoutInner>
  );
};

export default BaseLayout;
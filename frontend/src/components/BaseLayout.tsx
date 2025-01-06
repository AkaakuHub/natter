"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SideBar from "@/components/SideBar";
import { FooterMenu } from "./FooterMenu";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Swiper as SwiperComponent, SwiperSlide } from "swiper/react";
import type Swiper from "swiper";
import "swiper/css";
import { ExtendedSession } from "@/types";
import TimeLine from "./TimeLine";

const Header = ({ profileImage, profileOnClick, progress }: { profileImage?: string, profileOnClick?: () => void, progress: number }) => {
  return (
    <header className="h-[64px] border-b border-gray-200 p-4 relative flex items-center">
      {
        profileImage ? (
          <Image
            src={profileImage}
            alt={profileImage}
            width={32}
            height={32}
            className="rounded-full"
            onClick={profileOnClick}
            style={{ opacity: progress }}
          />
        ) : (
          <div className="rounded-full w-8 h-8 bg-gray-300" />
        )
      }
      <Image
        src="/web-app-manifest-192x192.png"
        alt="logo"
        width={32}
        height={32}
        className="absolute left-1/2 transform -translate-x-1/2"
      />
    </header>
  );
};

const BaseLayout = ({ session, children }: { session: ExtendedSession | null; children: React.ReactNode }) => {
  let path: string = usePathname();
  path = path.split("/")[1];

  const [swiperInstance, setSwiperInstance] = useState<Swiper | null>(null);
  const [progress, setProgress] = useState(1);
  const router = useRouter();

  useEffect(() => {
    if (swiperInstance) {
      const updateProgress = () => setProgress(swiperInstance.progress);
      swiperInstance.on("progress", updateProgress);
      return () => {
        swiperInstance.off("progress", updateProgress);
      };
    }
  }, [swiperInstance]);

  const profileOnClick = () => {
    if (swiperInstance) {
      swiperInstance.slideTo(0);
    }
  };

  const mainSlideOnClick = () => {
    if (swiperInstance && progress === 0) {
      swiperInstance.slideTo(1);
    }
  };

  // profileからtimelineへの一方通行
  useEffect(() => {
    if (swiperInstance) {
      swiperInstance.on("slideChange", () => {
        if (swiperInstance.activeIndex === 0 && path === "profile" && progress === 1) {
          router.push("/");
        }
      });
    }
    // progressは定数ではないため含めない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swiperInstance, router, path]);

  if (!session) {
    return (
      <div className="w-full h-screen">
        <Header progress={1} />
        {children}
        <FooterMenu path={path} />
      </div>
    );
  }

  if (path === "profile") {
    // 0枚目: TimeLine, 1枚目: Profile
    return (
      <div className="w-full h-full relative">
        <div className="fixed top-0 left-0 w-full h-screen z-0"
        style={{
          transform: `translateX(${-progress * 100}px)`,
        }}
        >
          <Header
            profileImage={session.user?.image ?? "no_avatar_image_128x128.png"}
            profileOnClick={profileOnClick}
            progress={1 - progress}
          />
          <div className="overflow-y-auto h-[calc(100dvh-64px-60px)] w-full">
            <TimeLine session={session} />
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
          onSwiper={(swiper) => setSwiperInstance(swiper)}
        >
          <SwiperSlide onClick={profileOnClick}>
            <div className="fixed top-0 left-0 w-full h-screen z-0">
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="w-full h-screen z-10">
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
    // 0枚目: SideBar, 1枚目: TimeLine
    return (
      <div className="w-full h-full relative">
        <SwiperComponent
          spaceBetween={-100}
          slidesPerView={1}
          initialSlide={1}
          speed={300}
          resistance={true}
          resistanceRatio={0}
          onSwiper={(swiper) => setSwiperInstance(swiper)}
        >
          <SwiperSlide>
            <div className="relative w-[calc(100vw-100px)] h-screen">
              <SideBar session={session} />
            </div>
          </SwiperSlide>
          <SwiperSlide onClick={mainSlideOnClick}>
            <div className="w-full h-screen">
              <Header
                profileImage={session.user?.image ?? "no_avatar_image_128x128.png"}
                profileOnClick={profileOnClick}
                progress={progress}
              />
              <div className="overflow-y-auto h-[calc(100dvh-64px-60px)] w-full">
                {children}
              </div>
              <FooterMenu path={path} />
              <div
                className="inset-0 bg-slate-600 pointer-events-none w-full h-screen fixed"
                style={{ opacity: 0.5 - progress * 0.5 }}
              />
            </div>
          </SwiperSlide>
        </SwiperComponent>
      </div>
    );
  }
};

export default BaseLayout;

"use client";

import React, { useState, useEffect } from "react";

import SideBar from "@/components/SideBar";
import { type Session } from "next-auth";
import { FooterMenu } from "./FooterMenu";
import { usePathname } from "next/navigation";
import Image from "next/image";

import { Swiper as SwiperComponent, SwiperSlide } from "swiper/react";
import type Swiper from "swiper";
import "swiper/css";

const BaseLayout = ({ session, children }: { session: Session | null; children?: React.ReactNode }) => {
  let path: string = usePathname();
  path = path.split("/")[1];

  const [swiperInstance, setSwiperInstance] = useState<Swiper | null>(null);
  const [progress, setProgress] = useState(1);

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

  if (!session) {
    return (
      <div className="w-full h-screen">
        <header className="border-b border-gray-200 p-4 relative flex items-center">
          <div className="rounded-full w-8 h-8 bg-gray-300" />
          <Image
            src="/web-app-manifest-192x192.png"
            alt="logo"
            width={32}
            height={32}
            className="absolute left-1/2 transform -translate-x-1/2"
          />
        </header>
        <FooterMenu path={path} />
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      <SwiperComponent
        spaceBetween={-100}
        slidesPerView={1}
        initialSlide={1}
        onSwiper={(swiper) => setSwiperInstance(swiper)}
      >
        <SwiperSlide>
          <div className="relative w-[calc(100vw-100px)] h-screen">
            <SideBar session={session} />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="w-full h-screen">
            <header className="border-b border-gray-200 p-4 relative flex items-center">
              <Image
                src={session.user?.image ?? "no_avatar_image_128x128.png"}
                alt={session.user?.name ?? "no_avatar_image_128x128.png"}
                width={32}
                height={32}
                className="rounded-full"
                onClick={profileOnClick}
                style={{ opacity: progress }}
              />
              <Image
                src="/web-app-manifest-192x192.png"
                alt="logo"
                width={32}
                height={32}
                className="absolute left-1/2 transform -translate-x-1/2"
              />
            </header>
            {children}
            <FooterMenu path={path} />
            <div
              className="inset-0 bg-slate-600 pointer-events-none w-full h-screen fixed"
              style={{ opacity: 0.2 - progress * 0.2 }}
            />
          </div>
        </SwiperSlide>
      </SwiperComponent>
    </div>
  );
};

export default BaseLayout;

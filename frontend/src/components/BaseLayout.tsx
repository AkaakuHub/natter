"use client";

import React, { useState } from "react";

import SideBar from "@/components/SideBar";
import { type Session } from "next-auth";
import { FooterMenu } from "./FooterMenu";
import { usePathname } from "next/navigation";
import Image from "next/image";

import { Swiper as SwiperComponent, SwiperSlide } from "swiper/react";
import type Swiper from "swiper";
import "swiper/css";

const BaseLayout = ({ session, children }: { session: Session; children: React.ReactNode }) => {
  let path: string = usePathname();
  path = path.split("/")[1];

  const [swiperInstance, setSwiperInstance] = useState<Swiper | null>(null);

  const profileOnClick = () => {
    if (swiperInstance) {
      swiperInstance.slideTo(0);
    }
  };

  return (
    <>
      <SwiperComponent
        spaceBetween={0}
        slidesPerView={1}
        initialSlide={1}
        onSwiper={(swiper) => setSwiperInstance(swiper)} // Swiper インスタンスを状態にセット
      >
        <SwiperSlide>
          <SideBar session={session} />
        </SwiperSlide>
        <SwiperSlide>
          <div className="border-b border-gray-200 p-4 relative flex items-center">
            <Image
              src={session.user?.image ?? "no_avatar_image_128x128.png"}
              alt={session.user?.name ?? "no_avatar_image_128x128.png"}
              width={32}
              height={32}
              className="rounded-full"
              onClick={profileOnClick}
            />
            <Image
              src="/web-app-manifest-192x192.png"
              alt="logo"
              width={32}
              height={32}
              className="absolute left-1/2 transform -translate-x-1/2"
            />
          </div>
          {children}
          <FooterMenu path={path} />
        </SwiperSlide>
      </SwiperComponent>
    </>
  );
};

export default BaseLayout;

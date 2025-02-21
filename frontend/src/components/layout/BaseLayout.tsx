"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import SideBar from "@/components/SideBar";
import { FooterMenu } from "../FooterMenu";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Swiper as SwiperComponent, SwiperSlide } from "swiper/react";
import type Swiper from "swiper";
import "swiper/css";
import { ExtendedSession } from "@/types";
import TimeLine from "../TimeLine";
import { LayoutProvider, useLayoutStore } from "./useLayout";
import ProfileComponent from "../Profile";
import clsx from "clsx";

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

const BaseLayoutInner = ({ session, children }: { session: ExtendedSession | null; children: React.ReactNode }) => {
  let path: string = usePathname();
  path = path.split("/")[1];

  const [swiperInstance, setSwiperInstance] = useState<Swiper | null>(null);
  const [progress, setProgress] = useState(1);
  const router = useRouter();
  const layoutStore = useLayoutStore();

  const [prevPath, setPrevPath] = useState<string | null>(null);
  const prevPathRef = useRef<string | null>(null);

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
        console.log("slideChangeイベントが発生しました");
        if (swiperInstance.activeIndex === 0 && progress === 1) {
          console.log("layoutStore: ", layoutStore);
          // もし、layoutStore.componentNamesが空ならpopしない
          if (layoutStore.componentNames.length >= 2) {
            console.log("popします");
            const tempPath = layoutStore.pop();
            console.log("poped tempPath: ", tempPath);
          }
          // この状態での,layoutStoreの末尾を取得
          const last = layoutStore.componentNames.at(-2);
          if (typeof last === "string") {
            // setPrevPath(tempPath);
            console.log("router.pushします, last: ", last);
            // 空文字列ならfalse
            router.push(last || "/");
          }
        }
        // if (swiperInstance.activeIndex === 0 && path === "profile" && progress === 1) {
        //   // layoutStore.pop();
        //   router.push("/");
        // }
      });
    }
    // progressは定数ではないため含めない
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swiperInstance, router, path]);

  // pathが変わったらlayoutStoreにpush
  useEffect(() => {
    // 現在のcomponentNamesを確認
    console.log("現在のcomponentNames: ", layoutStore.componentNames);

    // pathが変更されたか確認
    if (prevPathRef.current !== path) {
      // layoutStoreが空でないことを確認し、最後の要素が現在のpathと異なる場合のみ処理を行う
      if (layoutStore.componentNames.length === 0 || layoutStore.componentNames.at(-1) !== path) {
        // 現在のpathをpush
        console.log("pushします: ", path);
        layoutStore.push(path);
        console.log("後のcomponentNames: ", layoutStore.componentNames);

        // 最後の要素をprevPathにセット
        const tempPath = layoutStore.componentNames.at(-1); // pushする前の最後の要素を取得
        if (typeof tempPath === "string") {
          console.log("prevPathにセットしますtempPath: ", tempPath);
          setPrevPath(tempPath);
        }
      }
      // prevPathRefを更新
      prevPathRef.current = path;
    }
  }, [path, layoutStore.componentNames, layoutStore]);

  if (!session) {
    return (
      <div className="w-full h-screen">
        <Header progress={1} />
        {children}
        <FooterMenu path={path} />
      </div>
    );
  }

  const componentDict: { [key: string]: React.ReactNode } = {
    "profile": <ProfileComponent session={session} />,
    "": <TimeLine />,
  };

  if (prevPath !== null) {
    console.log("prevPathがnullじゃないです！: ", prevPath, "layoutStore: ", layoutStore);
    // 0枚目: prevPathに該当するコンポーネント, 1枚目: children
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
            {/* <TimeLine /> */}
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
          onSwiper={(swiper) => setSwiperInstance(swiper)}
        >
          <SwiperSlide onClick={profileOnClick}>
            <div className="fixed top-0 left-0 w-full h-screen">
            </div>
          </SwiperSlide>
          <SwiperSlide>
            {/* TODO: ダークモード */}
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
    // prevPathがないとき
    console.log("prevPathがnullです");
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
              <div className="overflow-y-auto h-[calc(100dvh-64px-60px)] w-full relative">
                {children}
              </div>
              <FooterMenu path={path} />
              <div
                className={clsx("absolute inset-0 bg-slate-600 pointer-events-none w-full h-screen fixed z-10", progress < 1 && "pointer-events-auto")}
                style={{ opacity: 0.5 - progress * 0.5 }}
              />
            </div>
          </SwiperSlide>
        </SwiperComponent>
      </div>
    );
  }
};

const BaseLayout = ({ session, children }: { session: ExtendedSession | null; children: React.ReactNode }) => {
  return (
    <BaseLayoutInner session={session} children={children} />
  )
};

export default BaseLayout;

"use client";

import React, { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import BaseLayout from "@/components/layout/BaseLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import PostComponent from "@/components/PostComponent";
import { ExtendedSession } from "@/types";

const TabKinds = ["tweets", "media", "likes"] as const;
type TabType = typeof TabKinds[number];
const TabNames: Record<TabType, string> = {
  tweets: "ポスト",
  media: "メディア",
  likes: "いいね",
};


const getDominantColor = async (image: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      resolve("#ecc24e");
      return;
    }

    const img = new window.Image();
    img.src = image;
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0, img.width, img.height);
      const data = context.getImageData(0, 0, img.width, img.height).data;
      const colorArray = Array.from(data);
      const colorArrayRGB = [];
      for (let i = 0; i < colorArray.length; i += 4) {
        const r = colorArray[i];
        const g = colorArray[i + 1];
        const b = colorArray[i + 2];
        colorArrayRGB.push([r, g, b]);
      }

      const colorArrayRGBSum = colorArrayRGB.reduce(
        (acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
        [0, 0, 0]
      );
      const colorArrayRGBAvg = colorArrayRGBSum.map((value) =>
        Math.floor(value / colorArrayRGB.length)
      );
      const [r, g, b] = colorArrayRGBAvg;
      const color = `rgb(${r}, ${g}, ${b})`;
      resolve(color);
    };
  });
};

const ProfileHeader = ({ session }: { session: ExtendedSession }) => {
  const [bgColor, setBgColor] = useState("#64748b");

  useEffect(() => {
    const image = session.user?.image ?? "/no_avatar_image_128x128.png";
    getDominantColor(image).then(setBgColor);
  }, [session.user?.image]);

  return (
    <div>
      <div
        className="h-16 w-full flex items-center justify-center"
        style={{
          backgroundColor: bgColor,
        }}
      />
      <div className="relative w-full flex flex-row items-center justify-center gap-2">
        <Image
          src={session.user?.image ?? "/no_avatar_image_128x128.png"}
          alt={session.user?.name ?? "no_avatar"}
          width={96}
          height={96}
          className="rounded-full border-4 border-white absolute -top-12"
        />
        <div className="mt-12 p-2">
          <div className="text-2xl font-bold text-center">{session.user?.name ?? "No Name"}</div>
          <div className="text-sm text-gray-500">@{session.user?.id ?? "no_id"}</div>
        </div>
      </div>
    </div>
  );
};

const TabsComponent = ({
  activeTab,
  onTabChange,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}) => {
  const tabs = TabKinds.map((tab) => ({
    id: tab,
    label: TabNames[tab],
  }));

  return (
    <div className="border-b border-gray-300">
      <div className="flex justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as "tweets" | "media" | "likes")}
            className={`py-2 w-full ${activeTab === tab.id
              ? "border-b-2 border-blue-500 font-bold"
              : "text-gray-500"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};


const ProfileInner = ({ session }: { session: ExtendedSession }) => {
  const [activeTab, setActiveTab] = useState<TabType>(
    "tweets"
  );
  // モックデータ
  const mockData = {
    posts: [
      {
        id: 5100001,
        userId: 100001,
        content: "this is a test post",
        images: ["/web-app-manifest-512x512.png"],
        createdAt: "2025-01-01T00:00:00",
        liked: [100001, 100002],
      },
      {
        id: 5100002,
        userId: 100002,
        content: "this is a test post 2",
        createdAt: "2025-01-01T01:00:00",
      },
      {
        id: 5100003,
        userId: 100003,
        content: "this is a test post 3",
        createdAt: "2025-01-01T02:00:00",
        liked: [100001, 100003],
      },
      {
        id: 5100004,
        userId: 100001,
        content: "this is a test post 4",
        images: [
          "/web-app-manifest-512x512.png",
          "/web-app-manifest-512x512.png",
        ],
        createdAt: "2025-01-01T04:00:00",
      },
      {
        id: 5100005,
        userId: 100001,
        content: "this is a test post 5",
        createdAt: "2025-01-01T05:00:00",
      },
    ],
    users: [
      {
        id: 100001,
        name: "test user 1",
        image: "/no_avatar_image_128x128.png",
      },
      {
        id: 100002,
        name: "test user 2",
        image: "/no_avatar_image_128x128.png",
      },
      {
        id: 100003,
        name: "test user 3",
        image: "/no_avatar_image_128x128.png",
      },
    ],
  };

  const getUserById = (userId: number) => mockData.users.find(user => user.id === userId);

  const filteredPosts =
    activeTab === "tweets"
      ? mockData.posts
      : activeTab === "media"
        ? mockData.posts.filter((post) => post.images)
        : mockData.posts.filter((post) => post.liked === session.user?.id);

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
            <div  className="overflow-y-auto h-[calc(100dvh-60px)] w-full">
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

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login");
    }
  }, [status, router]);
  if (status === "loading") {
    return (
      <BaseLayout session={null}>
        ここがスケルトン
      </BaseLayout>
    )
  }
  if (!session) {
    return null;
  }

  return (
    <BaseLayout session={session as ExtendedSession}>
      <div className="flex flex-col items-center justify-center gap-8 bg-slate-700 h-full">
        <ProfileInner session={session as ExtendedSession} />
      </div>
    </BaseLayout>

  )
}

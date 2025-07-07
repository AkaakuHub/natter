import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import clsx from "clsx";
import { getDominantColor } from "@/utils/colorUtils";
import { ExtendedSession } from "@/types";
import { UsersApi } from "@/api/users";
import { User } from "@/api/types";

interface ProfileHeaderProps {
  session: ExtendedSession;
  userId?: string;
}

const ProfileHeader = ({ session, userId }: ProfileHeaderProps) => {
  const [bgColor, setBgColor] = useState("#64748b");
  const [applyAnimation, setApplyAnimation] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const lastUserIdRef = useRef<string | undefined>(undefined);

  const displayUser = targetUser || currentUser;

  // 自分のユーザー情報を取得
  useEffect(() => {
    if (session.user?.id) {
      UsersApi.getUserById(session.user.id)
        .then((user) => setCurrentUser(user))
        .catch(() => {
          // APIからユーザーが取得できない場合はセッション情報をフォールバック
          setCurrentUser({
            id: session.user.id,
            name: session.user.name || "Unknown User",
            image: session.user.image || undefined,
            twitterId: session.user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        });
    }
  }, [session.user?.id, session.user?.name, session.user?.image]);

  // 他のユーザー情報を取得
  useEffect(() => {
    // 同じuserIdの場合は再実行しない
    if (lastUserIdRef.current === userId) {
      return;
    }

    lastUserIdRef.current = userId;

    if (userId && userId !== session.user?.id) {
      setLoading(true);
      UsersApi.getUserById(userId)
        .then((user) => setTargetUser(user))
        .catch(() => setTargetUser(null))
        .finally(() => setLoading(false));
    } else {
      setTargetUser(null);
      setLoading(false);
    }
  }, [userId, session.user?.id]);

  useEffect(() => {
    const image = displayUser?.image ?? "/no_avatar_image_128x128.png";
    getDominantColor(image).then((color) => {
      setBgColor(color);
      setApplyAnimation(true);
    });
  }, [displayUser?.image]);

  if (loading) {
    return (
      <div>
        <div className="h-16 w-full bg-surface-variant animate-pulse" />
        <div className="relative w-full flex flex-row items-center justify-center gap-2">
          <div className="w-24 h-24 bg-surface-variant rounded-full animate-pulse absolute -top-12" />
          <div className="mt-12 p-2">
            <div className="h-8 w-32 bg-surface-variant animate-pulse rounded mb-2" />
            <div className="h-4 w-20 bg-surface-variant animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className={clsx(
          "h-16 w-full flex items-center justify-center ease-in-out duration-500",
          applyAnimation ? "animate-fade-in" : "",
        )}
        style={{
          backgroundColor: bgColor,
        }}
      />
      <div className="relative w-full flex flex-row items-center justify-center gap-2">
        <Image
          src={displayUser?.image ?? "/no_avatar_image_128x128.png"}
          alt={displayUser?.name ?? "no_avatar"}
          width={96}
          height={96}
          className="rounded-full border-4 border-surface absolute -top-12"
        />
        <div className="mt-12 p-2">
          <div className="text-2xl font-bold text-center text-text">
            {displayUser?.name ?? "No Name"}
          </div>
          <div className="text-sm text-text-muted">
            @{displayUser?.id ?? "no_id"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;

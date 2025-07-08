import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import clsx from "clsx";
import { IconEdit } from "@tabler/icons-react";
import { getDominantColor } from "@/utils/colorUtils";
import { ExtendedSession } from "@/types";
import { UsersApi } from "@/api/users";
import { User } from "@/api/types";
import { FollowsApi } from "@/api/follows";
import EditProfileModal from "./EditProfileModal";
import FollowButton from "@/components/FollowButton";

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [followCounts, setFollowCounts] = useState({
    followingCount: 0,
    followersCount: 0,
  });
  const lastUserIdRef = useRef<string | undefined>(undefined);

  const displayUser = targetUser || currentUser;
  const isOwnProfile = !userId || userId === session.user?.id;

  const handleUserUpdated = (updatedUser: User) => {
    if (isOwnProfile) {
      setCurrentUser(updatedUser);
    } else {
      setTargetUser(updatedUser);
    }
  };

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

  // フォロー数を取得
  useEffect(() => {
    const fetchFollowCounts = async () => {
      const targetUserId = userId || session.user?.id;
      if (!targetUserId) return;

      try {
        const [following, followers] = await Promise.all([
          FollowsApi.getFollowing(targetUserId),
          FollowsApi.getFollowers(targetUserId),
        ]);
        setFollowCounts({
          followingCount: following.length,
          followersCount: followers.length,
        });
      } catch (error) {
        console.error("Failed to fetch follow counts:", error);
      }
    };

    fetchFollowCounts();
  }, [userId, session.user?.id]);

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
          <div className="flex items-center justify-center gap-2">
            <div className="text-2xl font-bold text-center text-text">
              {displayUser?.name ?? (
                <div className="h-8 w-32 bg-surface-variant animate-pulse rounded" />
              )}
            </div>
            {isOwnProfile && displayUser && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-1 rounded-full hover:bg-surface-hover transition-colors"
                title="プロフィールを編集"
              >
                <IconEdit size={20} className="text-text-muted" />
              </button>
            )}
          </div>
          <div className="text-sm text-text-muted text-center">
            @{displayUser?.id ?? "no_id"}
          </div>

          {/* フォロー数表示 */}
          <div className="flex justify-center gap-6 mt-3">
            <div className="text-center">
              <div className="text-lg font-bold text-text">
                {followCounts.followingCount}
              </div>
              <div className="text-xs text-text-muted">フォロー</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-text">
                {followCounts.followersCount}
              </div>
              <div className="text-xs text-text-muted">フォロワー</div>
            </div>
          </div>

          {!isOwnProfile && displayUser && (
            <div className="flex justify-center mt-4">
              <FollowButton
                userId={displayUser.id}
                currentUserId={session.user?.id}
                onFollowChange={(isFollowing) => {
                  // フォロー状態が変わったときにフォロワー数を更新（表示されているユーザーのフォロワー数を変更）
                  setFollowCounts((prev) => ({
                    ...prev,
                    followersCount: isFollowing
                      ? prev.followersCount + 1
                      : prev.followersCount - 1,
                  }));
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isOwnProfile && displayUser && (
        <EditProfileModal
          user={displayUser}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  );
};

export default ProfileHeader;

import React, { useState, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import { IconEdit } from "@tabler/icons-react";
import { getDominantColor } from "@/utils/colorUtils";
import { ExtendedSession } from "@/types";
import { User } from "@/api/types";
import EditProfileModal from "./EditProfileModal";
import FollowButton from "@/components/FollowButton";
import { useFollowing, useFollowers } from "@/hooks/queries/useFollows";
import { useUser } from "@/hooks/queries/useUsers";
import { useNavigation } from "@/hooks/useNavigation";

interface ProfileHeaderProps {
  session: ExtendedSession | null;
  userId?: string;
  isCompact?: boolean;
}

const ProfileHeader = ({
  session,
  userId,
  isCompact = false,
}: ProfileHeaderProps) => {
  const [bgColor, setBgColor] = useState("#64748b");
  const [applyAnimation, setApplyAnimation] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { navigateToFollowing, navigateToFollowers } = useNavigation();

  const isOwnProfile = !userId || userId === session?.user?.id;
  const targetUserId = userId || session?.user?.id;

  // React Query hooks for user data
  const { data: fetchedCurrentUser } = useUser(session?.user?.id || "");
  const { data: fetchedTargetUser } = useUser(userId || "");

  // React Query hooks for follow data
  const { data: following = [] } = useFollowing(targetUserId || "");
  const { data: followers = [] } = useFollowers(targetUserId || "");

  // Use React Query data if available, fallback to state
  const effectiveCurrentUser = fetchedCurrentUser || currentUser;
  const effectiveTargetUser = fetchedTargetUser || targetUser;
  const displayUser = effectiveTargetUser || effectiveCurrentUser;

  const followCounts = {
    followingCount: following.length,
    followersCount: followers.length,
  };

  const handleFollowingClick = () => {
    if (isOwnProfile) {
      navigateToFollowing();
    } else {
      navigateToFollowing(targetUserId);
    }
  };

  const handleFollowersClick = () => {
    if (isOwnProfile) {
      navigateToFollowers();
    } else {
      navigateToFollowers(targetUserId);
    }
  };

  const handleUserUpdated = (updatedUser: User) => {
    if (isOwnProfile) {
      setCurrentUser(updatedUser);
    } else {
      setTargetUser(updatedUser);
    }
  };

  // フォールバック用のセッション情報設定（React Queryでデータが取得できない場合）
  useEffect(() => {
    if (session?.user?.id && !fetchedCurrentUser && !currentUser) {
      setCurrentUser({
        id: session.user.id,
        name: session.user.name || "Unknown User",
        image: session.user.image || undefined,
        twitterId: session.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, [session?.user, fetchedCurrentUser, currentUser]);

  // React Queryでデータが取得されたらローディング状態を更新
  useEffect(() => {
    if (userId && userId !== session?.user?.id) {
      if (fetchedTargetUser) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [userId, session?.user?.id, fetchedTargetUser]);

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
        <div className="h-10 sm:h-16 w-full bg-surface-variant animate-pulse" />
        <div className="relative w-full flex flex-row items-center justify-center gap-2">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-surface-variant rounded-full animate-pulse absolute -top-8 sm:-top-12" />
          <div className="mt-8 sm:mt-12 p-2">
            <div className="h-6 sm:h-8 w-24 sm:w-32 bg-surface-variant animate-pulse rounded mb-2" />
            <div className="h-3 sm:h-4 w-16 sm:w-20 bg-surface-variant animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className={clsx(
          "w-full flex items-center justify-center ease-in-out duration-500",
          "h-10 sm:h-16", // モバイルでより小さなヘッダー
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
          className="rounded-full border-4 border-surface absolute w-16 h-16 sm:w-24 sm:h-24 -top-8 sm:-top-12"
          priority
        />
        <div
          className={clsx(
            "p-2 transition-all duration-300",
            isCompact ? "mt-6 sm:mt-8" : "mt-8 sm:mt-12",
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <div
              className={clsx(
                "font-bold text-center text-text transition-all duration-300",
                isCompact ? "text-sm sm:text-lg" : "text-lg sm:text-2xl",
              )}
            >
              {displayUser?.name ?? (
                <div className="h-6 sm:h-8 w-24 sm:w-32 bg-surface-variant animate-pulse rounded" />
              )}
            </div>
            {isOwnProfile && displayUser && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-1 rounded-full hover:bg-surface-hover transition-colors"
                title="プロフィールを編集"
              >
                <IconEdit size={18} className="text-text-muted sm:hidden" />
                <IconEdit
                  size={20}
                  className="text-text-muted hidden sm:block"
                />
              </button>
            )}
          </div>
          <div
            className={clsx(
              "text-text-muted text-center transition-all duration-300",
              isCompact ? "text-xs" : "text-xs sm:text-sm",
            )}
          >
            @{displayUser?.id ?? "no_id"}
          </div>

          {/* フォロー数表示 */}
          <div
            className={clsx(
              "flex justify-center gap-4 sm:gap-6 transition-all duration-300",
              isCompact ? "mt-1 sm:mt-2" : "mt-2 sm:mt-3",
            )}
          >
            <button
              onClick={session ? handleFollowingClick : undefined}
              disabled={!session}
              className={`text-center rounded-lg px-2 sm:px-3 py-1 sm:py-2 transition-colors ${
                session
                  ? "hover:bg-surface-hover cursor-pointer"
                  : "cursor-not-allowed opacity-50"
              }`}
              type="button"
            >
              <div className="text-sm sm:text-lg font-bold text-text">
                {followCounts.followingCount}
              </div>
              <div className="text-xs text-text-muted">フォロー</div>
            </button>
            <button
              onClick={session ? handleFollowersClick : undefined}
              disabled={!session}
              className={`text-center rounded-lg px-2 sm:px-3 py-1 sm:py-2 transition-colors ${
                session
                  ? "hover:bg-surface-hover cursor-pointer"
                  : "cursor-not-allowed opacity-50"
              }`}
              type="button"
            >
              <div className="text-sm sm:text-lg font-bold text-text">
                {followCounts.followersCount}
              </div>
              <div className="text-xs text-text-muted">フォロワー</div>
            </button>
          </div>

          {!isOwnProfile && displayUser && (
            <div className="flex justify-center mt-3 sm:mt-4">
              <FollowButton
                userId={displayUser.id}
                currentUserId={session?.user?.id}
                onFollowChange={() => {
                  // React Queryが自動的にキャッシュを更新するため、何もしない
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

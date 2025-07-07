import React from "react";
import Image from "next/image";
import { IconArrowLeft } from "@tabler/icons-react";

interface PostImage {
  id: number;
  url: string;
}

type ImageData = PostImage[] | string[];

interface ReplySourcePost {
  id: number;
  content?: string;
  images?: ImageData;
  author?: {
    name?: string;
    image?: string;
  };
}

interface ReplySourcePostProps {
  post: ReplySourcePost;
  variant?: "modal" | "detailed" | "inline";
  onPostClick?: () => void;
  showReplyLabel?: boolean;
}

const ReplySourcePost = ({
  post,
  variant = "modal",
  onPostClick,
  showReplyLabel = false,
}: ReplySourcePostProps) => {
  console.log("🖼️ ReplySourcePost images data:", {
    postId: post.id,
    images: post.images,
    isArray: Array.isArray(post.images),
    length: post.images?.length || 0,
    type: typeof post.images,
  });

  const hasImages =
    post.images && Array.isArray(post.images) && post.images.length > 0;

  // 画像データを統一形式に変換
  const normalizedImages: PostImage[] =
    post.images && Array.isArray(post.images)
      ? post.images.map((image, index) => {
          if (typeof image === "string") {
            const imageUrl = image.startsWith("http")
              ? image
              : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${image}`;
            console.log("🖼️ Converting string image:", {
              original: image,
              converted: imageUrl,
            });
            return {
              id: index,
              url: imageUrl,
            };
          } else {
            console.log("🖼️ Using PostImage object:", image);
            return image;
          }
        })
      : [];

  console.log("🖼️ Final normalized images:", normalizedImages);
  const isClickable = !!onPostClick;

  const renderImages = () => {
    console.log("🖼️ renderImages called:", {
      hasImages,
      normalizedImagesLength: normalizedImages.length,
    });

    if (!hasImages) {
      console.log("🖼️ No images to render");
      return null;
    }

    const imagesToShow = normalizedImages.slice(0, 3); // 最大3枚まで表示
    console.log("🖼️ Images to show:", imagesToShow);

    return (
      <div className="mt-2 flex gap-2">
        {imagesToShow.map((image, idx) => (
          <div
            key={`${image.id}-${idx}`}
            className="relative overflow-hidden rounded-lg"
          >
            <Image
              src={image.url}
              alt="投稿画像"
              width={60}
              height={60}
              className="w-16 h-16 object-cover"
              onError={(e) => {
                console.error("🖼️ Image load error:", {
                  url: image.url,
                  error: e,
                });
              }}
              onLoad={() => {
                console.log("🖼️ Image loaded successfully:", image.url);
              }}
            />
          </div>
        ))}
        {normalizedImages.length > 3 && (
          <div className="w-16 h-16 bg-surface-variant rounded-lg flex items-center justify-center">
            <span className="text-xs text-text-muted">
              +{normalizedImages.length - 3}
            </span>
          </div>
        )}
      </div>
    );
  };

  const content = (
    <div className="flex gap-3">
      <Image
        src={post.author?.image || "/no_avatar_image_128x128.png"}
        alt={post.author?.name || "User"}
        className={`rounded-full ${
          variant === "detailed"
            ? "w-10 h-10 ring-2 ring-border hover:ring-interactive/30 transition-all duration-300"
            : "w-10 h-10"
        }`}
        width={40}
        height={40}
      />
      <div className="flex-1 min-w-0">
        {showReplyLabel && (
          <p className="text-sm text-text-secondary mb-1">返信先</p>
        )}
        <div className="font-medium text-sm text-text">{post.author?.name}</div>
        <div
          className={`text-text-secondary text-sm mt-1 ${
            variant === "detailed" ? "line-clamp-2" : ""
          }`}
        >
          {post.content}
        </div>
        {renderImages()}
      </div>
      {variant === "detailed" && isClickable && (
        <IconArrowLeft
          size={20}
          className="text-text-muted rotate-180 flex-shrink-0"
        />
      )}
    </div>
  );

  const baseClasses = {
    modal: "p-4 border-b border-border-muted",
    detailed: "p-6 bg-surface-variant/50 border-b border-border/60",
    inline:
      "p-3 border-l-4 border-interactive/30 bg-surface-variant/30 rounded-r-lg ml-4",
  };

  if (isClickable && variant === "detailed") {
    return (
      <div className={baseClasses[variant]}>
        <button
          onClick={onPostClick}
          className="w-full text-left hover:bg-surface-variant transition-all duration-300 p-4 rounded-2xl hover:scale-[1.02]"
        >
          {content}
        </button>
      </div>
    );
  }

  return <div className={baseClasses[variant]}>{content}</div>;
};

export default ReplySourcePost;

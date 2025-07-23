import React, { useState, useEffect } from "react";
import Image from "next/image";
import { IconExternalLink, IconPhoto } from "@tabler/icons-react";
interface UrlMetadata {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  type?: string;
  favicon?: string;
  cachedAt?: Date;
}

interface UrlPreviewProps {
  url: string;
  className?: string;
}

const UrlPreview: React.FC<UrlPreviewProps> = ({ url, className = "" }) => {
  const [metadata, setMetadata] = useState<UrlMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        setError(null);

        // 基本的なURL検証（2文字以上のTLDを含む完全なドメイン名）
        if (
          !url ||
          !url.match(
            /^https?:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}/,
          )
        ) {
          console.log("Invalid URL format, skipping metadata fetch:", url);
          setError("Invalid URL format");
          return;
        }
        const backendUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!backendUrl) {
          throw new Error(
            "NEXT_PUBLIC_API_URL environment variable is not set",
          );
        }
        const requestUrl = `${backendUrl}/metadata?url=${encodeURIComponent(url)}`;
        const response = await fetch(requestUrl);

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Unknown error" }));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const data: UrlMetadata = await response.json();

        // メタデータが空の場合（存在しないドメイン等）は表示しない
        const hasValidMetadata =
          data.title || data.description || data.image || data.siteName;
        if (!hasValidMetadata) {
          setError("No metadata available");
          return;
        }

        setMetadata(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        console.error("Failed to fetch URL metadata:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchMetadata();
    }
  }, [url]);

  const handleClick = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div
        className={`border border-border rounded-lg p-4 bg-surface-variant animate-pulse ${className}`}
      >
        <div className="flex gap-3">
          <div className="w-16 h-16 bg-border rounded-lg flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-border rounded w-3/4"></div>
            <div className="h-3 bg-border rounded w-full"></div>
            <div className="h-3 bg-border rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !metadata) {
    // エラー時やメタデータが取得できない場合は何も表示しない
    return null;
  }

  return (
    <div
      className={`border border-border rounded-lg overflow-hidden bg-surface hover:bg-surface-hover transition-colors cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div className="flex">
        {/* サムネイル画像 */}
        {metadata.image && !imageError ? (
          <div className="w-20 h-20 flex-shrink-0 relative">
            <Image
              src={metadata.image}
              alt=""
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              sizes="80px"
              unoptimized={false} // メイン画像は最適化を使用
            />
          </div>
        ) : (
          <div className="w-20 h-20 flex-shrink-0 bg-surface-variant flex items-center justify-center">
            <IconPhoto size={24} className="text-text-muted" />
          </div>
        )}

        {/* メタデータ */}
        <div className="flex-1 p-3 min-w-0">
          {/* タイトル */}
          {metadata.title && (
            <h3 className="font-medium text-text text-sm line-clamp-2 mb-1">
              {metadata.title}
            </h3>
          )}

          {/* 説明 */}
          {metadata.description && (
            <p className="text-text-muted text-xs line-clamp-2 mb-2">
              {metadata.description}
            </p>
          )}

          {/* サイト情報 */}
          <div className="flex items-center gap-2 text-xs text-text-muted">
            {metadata.favicon && (
              <Image
                src={metadata.favicon}
                alt=""
                width={12}
                height={12}
                className="w-3 h-3 rounded-sm"
                onError={() => {}} // ファビコンエラーは無視
                unoptimized={true} // 小さなファビコンは最適化をスキップ
              />
            )}
            <span className="break-words overflow-wrap-anywhere flex-1 min-w-0">
              {metadata.siteName || new URL(metadata.url).hostname}
            </span>
            <IconExternalLink size={12} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrlPreview;

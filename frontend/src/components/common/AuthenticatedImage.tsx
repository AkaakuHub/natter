import React, { useState, useEffect } from "react";
import { getCachedImageWithAuth } from "@/utils/imageUtils";

interface AuthenticatedImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  loading?: "eager" | "lazy";
  decoding?: "async" | "sync" | "auto";
  onClick?: (e: React.MouseEvent) => void;
}

const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({
  src,
  alt,
  className,
  style,
  width,
  height,
  loading = "lazy",
  decoding = "async",
  onClick,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        if (src.includes("/posts/images/")) {
          const authenticatedSrc = await getCachedImageWithAuth(src);
          if (isMounted) {
            setImageSrc(authenticatedSrc);
          }
        } else {
          setImageSrc(src);
        }
      } catch (error) {
        console.error("Failed to load authenticated image:", error);
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadImage();

    return () => {
      isMounted = false;
    };
  }, [src]);

  const handleLoad = () => {
    setHasError(false);
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  return (
    <div className={`relative ${className}`} style={style}>
      {isLoading && (
        <div className="absolute inset-0 bg-surface-variant animate-pulse" />
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-variant text-text-muted">
          <span className="text-sm">画像を読み込めませんでした</span>
        </div>
      )}

      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-200`}
          style={style}
          width={width}
          height={height}
          loading={loading}
          decoding={decoding}
          onClick={onClick}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default AuthenticatedImage;

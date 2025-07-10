import React, { useState } from "react";
import Image, { ImageProps } from "next/image";

interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallback?: string;
  className?: string;
  priority?: boolean;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallback = "/no_avatar_image_128x128.png",
  className,
  priority = false,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-surface-variant animate-pulse rounded-inherit" />
      )}
      <Image
        src={error ? fallback : src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        loading={priority ? undefined : "lazy"}
        placeholder={priority ? undefined : "blur"}
        blurDataURL={
          priority
            ? undefined
            : "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZjNmNGY2Ii8+Cjwvc3ZnPgo="
        }
        priority={priority}
        quality={75}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;

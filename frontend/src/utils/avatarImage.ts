const DEFAULT_AVATAR_IMAGE = "/no_avatar_image_128x128.png";

export function avatarImageUrl(image?: string | null): string {
  if (!image) {
    return DEFAULT_AVATAR_IMAGE;
  }
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  return image.startsWith("/") ? image : `/${image}`;
}

export function isAuthenticatedPostImagePreview(imageUrl: string): boolean {
  return imageUrl.includes("/posts/images/");
}

export function getDirectImagePreviewUrls(imageUrls: string[]): string[] {
  return imageUrls.filter(
    (imageUrl) => !isAuthenticatedPostImagePreview(imageUrl),
  );
}

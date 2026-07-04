export function contentTypeForImageFilename(
  filename: string,
): string | undefined {
  const lowerFilename = filename.toLowerCase();
  if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (lowerFilename.endsWith(".png")) {
    return "image/png";
  }
  if (lowerFilename.endsWith(".gif")) {
    return "image/gif";
  }
  if (lowerFilename.endsWith(".webp")) {
    return "image/webp";
  }
  if (lowerFilename.endsWith(".avif")) {
    return "image/avif";
  }
  return undefined;
}

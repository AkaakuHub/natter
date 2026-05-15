export function sanitizeContent(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;")
    .replaceAll("/", "&#x2F;");
}

export function sanitizeContentPreservingUrls(value: string): string {
  const urlPattern = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;
  const urls: string[] = [];
  const contentWithPlaceholders = value.replace(urlPattern, (match) => {
    urls.push(match);
    return `__URL_PLACEHOLDER_${urls.length - 1}__`;
  });
  const sanitizedContent = sanitizeContent(contentWithPlaceholders);
  return sanitizedContent.replace(
    /__URL_PLACEHOLDER_(\d+)__/g,
    (match, index: string) => urls[Number(index)] ?? match,
  );
}

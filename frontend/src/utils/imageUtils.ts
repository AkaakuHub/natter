const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchImageWithAuth = async (imageUrl: string): Promise<string> => {
  const response = await fetch(toBackendProxyUrl(imageUrl), {
    credentials: "include",
    method: "GET",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

const imageCache = new Map<string, string>();

export const getCachedImageWithAuth = async (
  imageUrl: string,
): Promise<string> => {
  if (imageCache.has(imageUrl)) {
    return imageCache.get(imageUrl)!;
  }

  const blobUrl = await fetchImageWithAuth(imageUrl);
  imageCache.set(imageUrl, blobUrl);
  return blobUrl;
};

function toBackendProxyUrl(imageUrl: string): string {
  const url = new URL(imageUrl, window.location.origin);
  if (API_BASE_URL && url.origin === new URL(API_BASE_URL).origin) {
    return `/api/backend${url.pathname}${url.search}`;
  }
  return imageUrl;
}

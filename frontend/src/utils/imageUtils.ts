/**
 * JWTトークンを取得する（ApiClientのロジックと同様）
 */
const getJWTToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;

  try {
    // ローカルストレージからJWTトークンを取得
    const jwtToken = localStorage.getItem("jwt_token");

    if (!jwtToken) {
      console.warn("🔒 [IMAGE AUTH] No JWT token found in localStorage");
      return null;
    }

    // トークンの有効性をチェック
    const parts = jwtToken.split(".");
    if (parts.length !== 3) {
      console.warn("🔒 [IMAGE AUTH] Invalid JWT token format");
      localStorage.removeItem("jwt_token");
      return null;
    }

    try {
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;

      if (payload.exp && payload.exp < currentTime) {
        console.warn("🔒 [IMAGE AUTH] JWT token expired");
        localStorage.removeItem("jwt_token");
        return null;
      }

      return jwtToken;
    } catch (error) {
      console.warn("🔒 [IMAGE AUTH] Failed to decode JWT token:", error);
      localStorage.removeItem("jwt_token");
      return null;
    }
  } catch (error) {
    console.error("🔒 [IMAGE AUTH] Error getting JWT token:", error);
    return null;
  }
};

/**
 * 認証付きで画像を取得する
 * @param imageUrl 画像のURL
 * @returns 画像のBlob URL
 */
export const fetchImageWithAuth = async (imageUrl: string): Promise<string> => {
  try {
    const jwtToken = await getJWTToken();
    const response = await fetch(imageUrl, {
      method: "GET",
      headers: {
        ...(jwtToken && {
          Authorization: `Bearer ${jwtToken}`,
        }),
      },
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  } catch (error) {
    console.error("🔒 [IMAGE AUTH] ❌ Error fetching image with auth:", error);
    // フォールバック: 認証なしで画像を取得
    return imageUrl;
  }
};

/**
 * 画像URLをキャッシュする
 */
const imageCache = new Map<string, string>();

/**
 * 認証付きで画像を取得し、キャッシュする
 * @param imageUrl 画像のURL
 * @returns キャッシュされた画像のBlob URL
 */
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

/**
 * 画像キャッシュをクリア
 */
export const clearImageCache = () => {
  imageCache.forEach((blobUrl) => {
    URL.revokeObjectURL(blobUrl);
  });
  imageCache.clear();
};

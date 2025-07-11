"use client";

import { signOut } from "next-auth/react";
import { userCacheManager } from "./userCache";

/**
 * 完全なログアウト処理を実行
 * - NextAuth セッションをクリア
 * - ユーザーキャッシュをクリア
 * - ローカルストレージをクリア
 * - ページをリロードしてログイン画面を表示
 */
export const performCompleteLogout = async () => {
  try {
    // 1. ユーザーキャッシュをクリア
    userCacheManager.clearAll();

    // 2. ローカルストレージの関連データをクリア
    localStorage.removeItem("natter-last-check");
    localStorage.removeItem("natter-user-preferences");
    // 他の不要なデータもクリア
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("natter-") || key.startsWith("nextauth")) {
        localStorage.removeItem(key);
      }
    });
    // 3. SessionStorageもクリア
    sessionStorage.clear();
    // 4. NextAuth セッションをクリア（リダイレクトなし）
    await signOut({
      redirect: false,
      callbackUrl: "/login",
    });
    // 5. 完全にページをリロードしてクリーンな状態に
    window.location.href = "/login";
  } catch (error) {
    console.error("❌ [Logout] Error during logout process:", error);

    // エラーが発生した場合でも強制的にログイン画面へ
    window.location.href = "/login";
  }
};

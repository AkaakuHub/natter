"use client";

import { userCacheManager } from "./userCache";

export const performCompleteLogout = async () => {
  try {
    userCacheManager.clearAll();

    localStorage.removeItem("natter-last-check");
    localStorage.removeItem("natter-user-preferences");
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("natter-")) {
        localStorage.removeItem(key);
      }
    });
    localStorage.removeItem("jwt_token");
    sessionStorage.clear();
    window.location.href = "/_auth/logout";
  } catch (error) {
    console.error("Error during logout process:", error);
    window.location.href = "/_auth/logout";
  }
};

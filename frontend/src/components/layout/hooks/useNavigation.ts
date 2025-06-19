import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useLayoutStore } from "../useLayout";

export const useNavigation = () => {
  const params = useParams<{ id: string }>();
  const postId = params.id;
  const router = useRouter();
  const pathname = usePathname();
  const path = pathname.split("/")[1];
  const layoutStore = useLayoutStore();

  const [prevPath, setPrevPath] = useState<string | null>(null);
  const prevPathRef = useRef<string | null>(null);
  const [postIdFromHistory, setPostIdFromHistory] = useState<string>("");

  useEffect(() => {
    if (prevPathRef.current !== path) {
      if (layoutStore.componentNames.length === 0 || layoutStore.componentNames.at(-1)?.name !== path) {
        if (path === "") {
          layoutStore.clear();
        }
        if (layoutStore.componentNames.length === 0 && path !== "") {
          layoutStore.push({ name: "" });
          setPrevPath("");
        }
        if (path === "post") {
          if (typeof postId === "string") {
            layoutStore.push({ name: path, extra: postId });
          }
        } else {
          layoutStore.push({ name: path });
        }

        const tempPath = layoutStore.componentNames.at(-1);
        if (tempPath?.name != null) {
          setPrevPath(tempPath.name);
        }
      } else {
        const tempPath = layoutStore.componentNames.at(-2);
        if (tempPath?.name != null) {
          setPrevPath(tempPath.name);
          if (tempPath.extra) {
            setPostIdFromHistory(tempPath.extra);
          }
        }
      }
      prevPathRef.current = path;
    }
  }, [path, postId, layoutStore.componentNames, layoutStore]);

  const handleBackNavigation = () => {
    if (layoutStore.componentNames.length >= 1 && path !== "") {
      layoutStore.pop();
    }
    const last = layoutStore.componentNames.at(-2);
    if (last?.name != null) {
      if (last.extra) {
        setPostIdFromHistory(last.extra);
      }
      router.push("/" + last.name || "/");
    }
  };

  return {
    path,
    prevPath,
    postIdFromHistory,
    handleBackNavigation,
  };
};
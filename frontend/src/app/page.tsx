import React from "react";
import { HybridSPA } from "@/core/HybridSPA";

interface Props {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

const HybridSinglePageApplication = async ({ searchParams }: Props) => {
  const params = await searchParams;
  const ssrPath = params["ssr-path"];
  const spaPath = params["spa-path"];
  const ssrMode = params["ssr-mode"] === "true";

  const initialPath = ssrPath || spaPath || "/";

  // デバッグログ
  console.log("🔥 [SSR Page] SearchParams:", {
    params,
    ssrPath,
    spaPath,
    ssrMode,
    initialPath,
  });

  return <HybridSPA initialPath={initialPath} ssrMode={ssrMode} />;
};

export default HybridSinglePageApplication;

export const primaryScrollContainerAttribute = "data-scroll-container";
export const primaryScrollContainerSelector = "[data-scroll-container]";

export const appViewportClassName = "app-viewport w-full flex flex-col";

export const primaryScrollContainerClassName =
  "mobile-safe-scroll flex-1 overflow-y-auto bg-surface-variant max-w-md mx-auto lg:mx-0 lg:max-w-none scrollbar-hide";

export const plainScrollContainerClassName = "flex-1 overflow-y-auto";

export const scrollbarHiddenStyle = {
  scrollbarWidth: "none",
  msOverflowStyle: "none",
} as const;

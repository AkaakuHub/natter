import { useState, useEffect } from "react";
import type Swiper from "swiper";

export const useSwiper = () => {
  const [swiperInstance, setSwiperInstance] = useState<Swiper | null>(null);
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (swiperInstance) {
      const updateProgress = () => setProgress(swiperInstance.progress);
      swiperInstance.on("progress", updateProgress);
      return () => {
        swiperInstance.off("progress", updateProgress);
      };
    }
  }, [swiperInstance]);

  const setupSlideChangeHandler = (onBackNavigation: () => void) => {
    if (swiperInstance) {
      swiperInstance.on("slideChange", () => {
        if (swiperInstance.activeIndex === 0 && progress === 1) {
          onBackNavigation();
        }
      });
    }
  };

  const profileOnClick = () => {
    if (swiperInstance) {
      swiperInstance.slideTo(0);
    }
  };

  const mainSlideOnClick = () => {
    if (swiperInstance && progress === 0) {
      swiperInstance.slideTo(1);
    }
  };

  return {
    swiperInstance,
    setSwiperInstance,
    progress,
    profileOnClick,
    mainSlideOnClick,
    setupSlideChangeHandler,
  };
};
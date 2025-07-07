import { useState, useEffect, useCallback, useRef } from "react";

interface UseInfiniteScrollProps {
  hasNextPage: boolean;
  isFetching: boolean;
  onLoadMore: () => void;
  threshold?: number;
}

interface UseInfiniteScrollResult {
  sentryRef: (node?: Element | null) => void;
  isLoading: boolean;
}

export const useInfiniteScroll = ({
  hasNextPage,
  isFetching,
  onLoadMore,
  threshold = 1.0,
}: UseInfiniteScrollProps): UseInfiniteScrollResult => {
  const [isLoading, setIsLoading] = useState(false);
  const observer = useRef<IntersectionObserver>();

  const sentryRef = useCallback(
    (node: Element | null) => {
      if (isFetching) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting && hasNextPage) {
            setIsLoading(true);
            onLoadMore();
          }
        },
        { threshold },
      );
      if (node) observer.current.observe(node);
    },
    [isFetching, hasNextPage, onLoadMore, threshold],
  );

  useEffect(() => {
    if (!isFetching) {
      setIsLoading(false);
    }
  }, [isFetching]);

  return { sentryRef, isLoading };
};
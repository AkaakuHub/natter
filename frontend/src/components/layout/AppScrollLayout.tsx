"use client";

import React, { forwardRef } from "react";
import {
  appViewportClassName,
  plainScrollContainerClassName,
  primaryScrollContainerAttribute,
  primaryScrollContainerClassName,
  scrollbarHiddenStyle,
} from "./scrollLayout";

interface AppViewportProps {
  children: React.ReactNode;
}

export const AppViewport = ({ children }: AppViewportProps) => {
  return <div className={appViewportClassName}>{children}</div>;
};

interface ScrollContainerProps {
  children: React.ReactNode;
}

export const PlainScrollContainer = forwardRef<
  HTMLDivElement,
  ScrollContainerProps
>(({ children }, ref) => {
  return (
    <div ref={ref} className={plainScrollContainerClassName}>
      {children}
    </div>
  );
});

PlainScrollContainer.displayName = "PlainScrollContainer";

export const PrimaryScrollContainer = forwardRef<
  HTMLDivElement,
  ScrollContainerProps
>(({ children }, ref) => {
  return (
    <div
      ref={ref}
      {...{ [primaryScrollContainerAttribute]: true }}
      className={primaryScrollContainerClassName}
      style={scrollbarHiddenStyle}
    >
      {children}
    </div>
  );
});

PrimaryScrollContainer.displayName = "PrimaryScrollContainer";

interface MainContentAreaProps {
  children: React.ReactNode;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  sidebar?: React.ReactNode;
}

export const MainContentArea = ({
  children,
  scrollContainerRef,
  sidebar,
}: MainContentAreaProps) => {
  return (
    <div className="flex-1 flex overflow-hidden">
      <PrimaryScrollContainer ref={scrollContainerRef}>
        {children}
      </PrimaryScrollContainer>
      {sidebar}
    </div>
  );
};

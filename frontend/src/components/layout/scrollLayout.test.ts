import { describe, expect, it } from "vitest";

import {
  appViewportClassName,
  primaryScrollContainerAttribute,
  primaryScrollContainerClassName,
  primaryScrollContainerSelector,
} from "./scrollLayout";

describe("scroll layout contract", () => {
  it("uses one stable data attribute for the primary app scroll container", () => {
    expect(primaryScrollContainerAttribute).toBe("data-scroll-container");
    expect(primaryScrollContainerSelector).toBe("[data-scroll-container]");
  });

  it("keeps viewport and primary scroll ownership in the shared classes", () => {
    expect(appViewportClassName).toContain("app-viewport");
    expect(primaryScrollContainerClassName).toContain("mobile-safe-scroll");
    expect(primaryScrollContainerClassName).toContain("overflow-y-auto");
  });
});

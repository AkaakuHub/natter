import { describe, expect, it } from "vitest";

import { normalizedPostImageSize } from "./normalizePostImages";

describe("normalizedPostImageSize", () => {
  it("keeps a 10000px long edge when total pixels fit the safe canvas budget", () => {
    expect(normalizedPostImageSize(10_000, 1_000)).toEqual({
      width: 10_000,
      height: 1_000,
    });
  });

  it("scales square high-resolution images to the safe canvas pixel budget", () => {
    expect(normalizedPostImageSize(10_000, 10_000)).toEqual({
      width: 4096,
      height: 4096,
    });
  });

  it("scales images with an edge over 10000px without exceeding the safe canvas pixel budget", () => {
    expect(normalizedPostImageSize(20_000, 1_000)).toEqual({
      width: 10_000,
      height: 500,
    });
  });

  it("rejects invalid dimensions", () => {
    expect(() => normalizedPostImageSize(0, 100)).toThrow(
      "画像の寸法を取得できませんでした",
    );
  });
});

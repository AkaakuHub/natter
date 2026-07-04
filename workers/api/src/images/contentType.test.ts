import { describe, expect, it } from "vitest";

import { contentTypeForImageFilename } from "./contentType";

describe("contentTypeForImageFilename", () => {
  it("detects supported image content types by filename extension", () => {
    expect(contentTypeForImageFilename("a.jpg")).toBe("image/jpeg");
    expect(contentTypeForImageFilename("a.JPEG")).toBe("image/jpeg");
    expect(contentTypeForImageFilename("a.png")).toBe("image/png");
    expect(contentTypeForImageFilename("a.gif")).toBe("image/gif");
    expect(contentTypeForImageFilename("a.webp")).toBe("image/webp");
    expect(contentTypeForImageFilename("a.avif")).toBe("image/avif");
  });

  it("returns undefined for unsupported extensions", () => {
    expect(contentTypeForImageFilename("a.txt")).toBeUndefined();
  });
});

import { encode as encodePng } from "fast-png";
import { describe, expect, it } from "vitest";

import { HttpError } from "../http";
import {
  createMosaicImage,
  createMosaicImageResponse,
  mosaicImageFilename,
} from "./mosaic";

describe("mosaicImageFilename", () => {
  it("stores mosaic images below the mosaics prefix as PNG files", () => {
    expect(mosaicImageFilename("images-1.jpg")).toBe(
      "mosaics/images-1.jpg.png",
    );
  });
});

describe("createMosaicImage", () => {
  it("creates PNG mosaic images from PNG input", () => {
    const sourcePng = encodePng({
      width: 1,
      height: 1,
      channels: 4,
      depth: 8,
      data: new Uint8Array([10, 20, 30, 255]),
    });

    const mosaic = createMosaicImage({
      data: sourcePng.buffer.slice(
        sourcePng.byteOffset,
        sourcePng.byteOffset + sourcePng.byteLength,
      ),
      contentType: "image/png",
    });

    expect(mosaic.contentType).toBe("image/png");
    expect(mosaic.body.length).toBeGreaterThan(0);
  });

  it("rejects unsupported image content types", () => {
    expect(() =>
      createMosaicImage({
        data: new ArrayBuffer(0),
        contentType: "image/gif",
      }),
    ).toThrow(HttpError);
  });
});

describe("createMosaicImageResponse", () => {
  it("returns PNG responses with no-store cache headers", () => {
    const body = new Response("image").body;
    if (!body) {
      throw new Error("Response body is missing");
    }

    const response = createMosaicImageResponse({
      mosaic: { body } as R2ObjectBody,
    });

    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Cache-Control")).toBe(
      "no-cache, no-store, must-revalidate",
    );
  });
});

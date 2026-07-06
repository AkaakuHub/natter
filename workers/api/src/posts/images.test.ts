import { encode as encodePng } from "fast-png";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Env } from "../env";
import { HttpError } from "../http";
import { savePostImages } from "./images";

type PutCall = {
  key: string;
  value: unknown;
  options?: R2PutOptions;
};

function createEnv(putCalls: PutCall[]): Env {
  return {
    DB: {} as D1Database,
    ASSETS: {
      put: async (key: string, value: unknown, options?: R2PutOptions) => {
        putCalls.push({ key, value, options });
        return {} as R2Object;
      },
    } as R2Bucket,
    ACCOUNT_URL: "https://accounts.example.com",
    APP_ID: "app-id",
    APP_SESSION_HMAC_SECRET: "secret",
    SESSION_KID: "kid",
    AUTH_MODE: "local-header",
  };
}

function createPngFile(
  name: string,
  type = "image/png",
  width = 1,
  height = 1,
): File {
  const png = encodePng({
    width,
    height,
    channels: 4,
    depth: 8,
    data: createRgbaPixels(width, height),
  });
  return new File([png], name, { type });
}

function createRgbaPixels(width: number, height: number): Uint8Array {
  const data = new Uint8Array(width * height * 4);
  for (let index = 0; index < data.length; index += 4) {
    data[index] = 10;
    data[index + 1] = 20;
    data[index + 2] = 30;
    data[index + 3] = 255;
  }
  return data;
}

function createInvalidImageFile(name: string, type = "image/gif"): File {
  return new File([new Uint8Array([1, 2, 3, 4])], name, { type });
}

function createPngHeaderFile(width: number, height: number): File {
  const bytes = new Uint8Array(24);
  bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return new File([bytes], "huge.png", { type: "image/png" });
}

beforeEach(() => {
  vi.spyOn(Date, "now").mockReturnValue(1_788_480_000_000);
  vi.stubGlobal("crypto", {
    randomUUID: () => "uuid",
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("savePostImages", () => {
  it("stores original and mosaic images and returns generated filenames", async () => {
    const putCalls: PutCall[] = [];
    const env = createEnv(putCalls);

    await expect(
      savePostImages(env, [createPngFile("upload.PNG")]),
    ).resolves.toEqual(["images-1788480000000-uuid.png"]);

    expect(putCalls).toHaveLength(2);
    expect(putCalls[0].key).toBe("mosaics/images-1788480000000-uuid.png.png");
    expect(putCalls[0].options).toEqual({
      httpMetadata: { contentType: "image/png" },
    });
    expect(putCalls[1].key).toBe("images-1788480000000-uuid.png");
    expect(putCalls[1].options).toEqual({
      httpMetadata: { contentType: "image/png" },
    });
  });

  it("rejects non-file form values", async () => {
    await expect(savePostImages(createEnv([]), ["not-file"])).rejects.toThrow(
      HttpError,
    );
  });

  it("uses detected image bytes instead of trusting MIME type", async () => {
    const putCalls: PutCall[] = [];
    const env = createEnv(putCalls);

    await expect(
      savePostImages(env, [createPngFile("upload.gif", "image/gif")]),
    ).resolves.toEqual(["images-1788480000000-uuid.png"]);

    expect(putCalls[1].options).toEqual({
      httpMetadata: { contentType: "image/png" },
    });
  });

  it("accepts long-edge images when the total pixel count is safe", async () => {
    const putCalls: PutCall[] = [];
    const env = createEnv(putCalls);

    await expect(
      savePostImages(env, [createPngFile("wide.png", "image/png", 10_000, 1)]),
    ).resolves.toEqual(["images-1788480000000-uuid.png"]);
  });

  it("rejects unsupported image bytes before storage", async () => {
    await expect(
      savePostImages(createEnv([]), [createInvalidImageFile("upload.gif")]),
    ).rejects.toThrow("Only PNG and JPEG images are allowed");
  });

  it("rejects image dimensions that would exceed the Worker memory budget", async () => {
    await expect(
      savePostImages(createEnv([]), [createPngHeaderFile(10_000, 2_000)]),
    ).rejects.toThrow("Image dimensions exceed safe pixel limit");
  });
});

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

function createPngFile(name: string, type = "image/png"): File {
  const png = encodePng({
    width: 1,
    height: 1,
    channels: 4,
    depth: 8,
    data: new Uint8Array([10, 20, 30, 255]),
  });
  return new File([png], name, { type });
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

    await expect(savePostImages(env, [createPngFile("upload.PNG")])).resolves
      .toEqual(["images-1788480000000-uuid.png"]);

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

  it("rejects unsupported image types before storage", async () => {
    await expect(
      savePostImages(createEnv([]), [createPngFile("upload.gif", "image/gif")]),
    ).rejects.toThrow("Only PNG and JPEG images are allowed");
  });
});

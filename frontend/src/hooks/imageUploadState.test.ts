import { describe, expect, it } from "vitest";

import { selectImageFilesToAdd } from "./imageUploadState";

const imageFile = (name: string) =>
  new File(["image"], name, { type: "image/png" });

describe("selectImageFilesToAdd", () => {
  it("returns the same files that must receive preview URLs", () => {
    const files = [imageFile("a.png"), imageFile("b.png")];

    expect(selectImageFilesToAdd(0, files, 10)).toEqual({
      filesToAdd: files,
      limitMessage: null,
    });
  });

  it("limits added files and reports the accepted count", () => {
    const files = [imageFile("a.png"), imageFile("b.png"), imageFile("c.png")];

    expect(selectImageFilesToAdd(8, files, 10)).toEqual({
      filesToAdd: files.slice(0, 2),
      limitMessage: "画像は最大10枚までです。2枚のみ追加されました。",
    });
  });

  it("rejects files when there are no remaining slots", () => {
    expect(selectImageFilesToAdd(10, [imageFile("a.png")], 10)).toEqual({
      filesToAdd: [],
      limitMessage: "画像は最大10枚までアップロードできます",
    });
  });
});

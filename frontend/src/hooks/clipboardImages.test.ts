import { describe, expect, it } from "vitest";

import { imageFilesFromClipboardItems } from "./clipboardImages";

const imageFile = new File(["image"], "pasted.png", { type: "image/png" });
const textFile = new File(["text"], "note.txt", { type: "text/plain" });

describe("imageFilesFromClipboardItems", () => {
  it("extracts image files pasted from the clipboard", () => {
    const files = imageFilesFromClipboardItems([
      {
        kind: "file",
        type: "image/png",
        getAsFile: () => imageFile,
      },
      {
        kind: "file",
        type: "text/plain",
        getAsFile: () => textFile,
      },
      {
        kind: "string",
        type: "text/plain",
        getAsFile: () => null,
      },
    ]);

    expect(files).toEqual([imageFile]);
  });
});

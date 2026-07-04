import { describe, expect, it } from "vitest";

import {
  getCharacterColorStyle,
  getCharacterTextColor,
} from "./characterColorUtils";

describe("getCharacterColorStyle", () => {
  it("selects a stable palette color from character name length", () => {
    expect(getCharacterColorStyle("abc")).toEqual({
      backgroundColor: "#86efac80",
      borderColor: "#86efac",
    });
  });

  it("converts opacity to a two digit alpha channel", () => {
    expect(getCharacterColorStyle("abc", 1)).toEqual({
      backgroundColor: "#86efacff",
      borderColor: "#86efac",
    });
    expect(getCharacterColorStyle("abc", 0)).toEqual({
      backgroundColor: "#86efac00",
      borderColor: "#86efac",
    });
  });
});

describe("getCharacterTextColor", () => {
  it("returns black text for bright palette colors", () => {
    expect(getCharacterTextColor("abc")).toBe("#000000");
  });

  it("returns black text for the tan palette color", () => {
    expect(getCharacterTextColor("abcdefghijklmno")).toBe("#000000");
  });
});

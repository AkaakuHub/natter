import { describe, expect, it } from "vitest";

import { decodeContentForEditing, decodeHtmlEntities } from "./decodeContent";

describe("decodeContent decodeHtmlEntities", () => {
  it("decodes all supported entities for editing", () => {
    expect(
      decodeHtmlEntities("&amp;&lt;&gt;&quot;&#x27;&#x2F;&#x5C;&#x60;&#x3D;"),
    ).toBe("&<>\"'/\\`=");
  });

  it("keeps empty content unchanged", () => {
    expect(decodeHtmlEntities("")).toBe("");
  });
});

describe("decodeContentForEditing", () => {
  it("delegates to HTML entity decoding", () => {
    expect(decodeContentForEditing("https:&#x2F;&#x2F;example.com")).toBe(
      "https://example.com",
    );
  });
});

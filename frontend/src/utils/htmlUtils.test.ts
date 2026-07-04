import { describe, expect, it } from "vitest";

import { breakLongWords, decodeHtmlEntities } from "./htmlUtils";

describe("decodeHtmlEntities", () => {
  it("decodes the supported HTML entities", () => {
    expect(
      decodeHtmlEntities(
        "&lt;a href=&quot;&#x2F;path&#x3D;1&quot;&gt;it&#x27;s&amp;ok&#x60;&lt;&#x2F;a&gt;",
      ),
    ).toBe('<a href="/path=1">it\'s&ok`</a>');
  });

  it("keeps empty text unchanged", () => {
    expect(decodeHtmlEntities("")).toBe("");
  });
});

describe("breakLongWords", () => {
  it("inserts zero-width spaces every ten characters for long words", () => {
    expect(breakLongWords("abcdefghijklmnopqrstuv")).toBe(
      "abcdefghij\u200Bklmnopqrst\u200Buv",
    );
  });

  it("does not split short words or whitespace", () => {
    expect(breakLongWords("short words")).toBe("short words");
  });
});

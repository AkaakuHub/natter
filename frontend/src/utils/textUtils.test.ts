import { describe, expect, it } from "vitest";

import { calculateEffectiveLength, parseTextWithUrls } from "./textUtils";

describe("parseTextWithUrls", () => {
  it("splits text and HTTPS URLs into ordered segments", () => {
    expect(parseTextWithUrls("Check https://example.com/path now")).toEqual({
      segments: [
        { type: "text", content: "Check ", start: 0, end: 6 },
        {
          type: "url",
          content: "https://example.com/path",
          start: 6,
          end: 30,
        },
        { type: "text", content: " now", start: 30, end: 34 },
      ],
      effectiveLength: 15,
    });
  });

  it("does not treat incomplete domains as URLs", () => {
    expect(parseTextWithUrls("Visit https://localhost/test")).toEqual({
      segments: [
        {
          type: "text",
          content: "Visit https://localhost/test",
          start: 0,
          end: 28,
        },
      ],
      effectiveLength: 28,
    });
  });

  it("removes zero-width characters before measuring text", () => {
    expect(parseTextWithUrls("a\u200Bb\uFEFFc")).toEqual({
      segments: [{ type: "text", content: "abc", start: 0, end: 3 }],
      effectiveLength: 3,
    });
  });
});

describe("calculateEffectiveLength", () => {
  it("counts URLs as one fifth of their length rounded up", () => {
    expect(calculateEffectiveLength("x https://example.com/12345 y")).toBe(9);
  });
});

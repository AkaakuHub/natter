import { describe, expect, it } from "vitest";

import { sanitizeContent, sanitizeContentPreservingUrls } from "./sanitize";

describe("sanitizeContent", () => {
  it("escapes HTML-sensitive characters", () => {
    expect(sanitizeContent(`<img src="/x" alt="it's">`)).toBe(
      "&lt;img src=&quot;&#x2F;x&quot; alt=&quot;it&#x27;s&quot;&gt;",
    );
  });
});

describe("sanitizeContentPreservingUrls", () => {
  it("escapes text around URLs and keeps URLs clickable", () => {
    expect(
      sanitizeContentPreservingUrls(
        `before <b> https://example.com/a?x=1&y=2 after`,
      ),
    ).toBe(
      "before &lt;b&gt; https://example.com/a?x=1&y=2 after",
    );
  });

  it("preserves the URL before unsafe delimiter characters", () => {
    expect(sanitizeContentPreservingUrls(`https://example.com/<script>`)).toBe(
      "https://example.com/&lt;script&gt;",
    );
  });
});

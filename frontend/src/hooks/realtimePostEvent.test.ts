import { describe, expect, it } from "vitest";

import { parsePostCreatedEvent } from "./realtimePostEvent";

describe("parsePostCreatedEvent", () => {
  it("parses post-created realtime messages", () => {
    expect(
      parsePostCreatedEvent(
        JSON.stringify({ type: "post-created", postId: 1, authorId: "user-1" }),
      ),
    ).toEqual({ type: "post-created", postId: 1, authorId: "user-1" });
  });

  it("ignores malformed realtime messages", () => {
    expect(parsePostCreatedEvent("not-json")).toBeUndefined();
    expect(
      parsePostCreatedEvent(JSON.stringify({ type: "connected", postId: 1 })),
    ).toBeUndefined();
    expect(
      parsePostCreatedEvent(
        JSON.stringify({ type: "post-created", postId: "1" }),
      ),
    ).toBeUndefined();
    expect(
      parsePostCreatedEvent(JSON.stringify({ type: "post-created", postId: 1 })),
    ).toBeUndefined();
  });
});

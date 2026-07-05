import { describe, expect, it } from "vitest";

import { RealtimeHub } from "./realtime";

const decoder = new TextDecoder();

describe("RealtimeHub", () => {
  it("streams connected and post-created events as SSE", async () => {
    const hub = new RealtimeHub();
    const abortController = new AbortController();
    const response = await hub.fetch(
      new Request("https://realtime/events", {
        signal: abortController.signal,
      }),
    );
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("SSE response body is missing");
    }

    const connected = await reader.read();
    expect(decoder.decode(connected.value)).toBe(
      'event: connected\ndata: {"ok":true}\n\n',
    );

    const broadcastResponse = await hub.fetch(
      new Request("https://realtime/broadcast", {
        method: "POST",
        body: JSON.stringify({
          type: "post-created",
          postId: 1,
          authorId: "user-1",
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(broadcastResponse.status).toBe(204);

    const postCreated = await reader.read();
    expect(decoder.decode(postCreated.value)).toBe(
      'event: post-created\ndata: {"type":"post-created","postId":1,"authorId":"user-1"}\n\n',
    );

    abortController.abort();
    await reader.cancel();
  });

  it("returns 404 for unknown realtime routes", async () => {
    const response = await new RealtimeHub().fetch(
      new Request("https://realtime/unknown"),
    );

    expect(response.status).toBe(404);
  });
});

type RealtimeEvent = {
  type: "post-created";
  postId: number;
  authorId: string;
};

type Client = {
  id: string;
  writer: WritableStreamDefaultWriter<Uint8Array>;
};

const encoder = new TextEncoder();

export class RealtimeHub {
  private clients = new Map<string, Client>();

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/events") {
      return this.connect(request);
    }
    if (request.method === "POST" && url.pathname === "/broadcast") {
      const event = (await request.json()) as RealtimeEvent;
      this.broadcast(event);
      return new Response(null, { status: 204 });
    }
    return new Response("Not found", { status: 404 });
  }

  private connect(request: Request): Response {
    const { readable, writable } = new TransformStream<Uint8Array>();
    const writer = writable.getWriter();
    const clientId = crypto.randomUUID();
    this.clients.set(clientId, { id: clientId, writer });
    void writeSse(writer, {
      event: "connected",
      data: { ok: true },
    });

    request.signal.addEventListener("abort", () => {
      this.removeClient(clientId);
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Connection: "keep-alive",
      },
    });
  }

  private broadcast(event: RealtimeEvent): void {
    Array.from(this.clients.values()).forEach((client) => {
      void writeSse(client.writer, {
        event: event.type,
        data: event,
      }).catch(() => this.removeClient(client.id));
    });
  }

  private removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) {
      return;
    }
    this.clients.delete(clientId);
    void client.writer.close().catch(() => undefined);
  }
}

async function writeSse(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  message: { event: string; data: unknown },
): Promise<void> {
  await writer.write(
    encoder.encode(
      `event: ${message.event}\ndata: ${JSON.stringify(message.data)}\n\n`,
    ),
  );
}

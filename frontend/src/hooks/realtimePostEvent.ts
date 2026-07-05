export type PostCreatedEvent = {
  type: "post-created";
  postId: number;
  authorId: string;
};

export function parsePostCreatedEvent(
  value: string,
): PostCreatedEvent | undefined {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!isPostCreatedEvent(parsed)) {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

function isPostCreatedEvent(value: unknown): value is PostCreatedEvent {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const event = value as { type?: unknown; postId?: unknown };
  return (
    event.type === "post-created" &&
    typeof event.postId === "number" &&
    typeof (value as { authorId?: unknown }).authorId === "string"
  );
}

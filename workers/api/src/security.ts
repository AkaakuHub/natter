import { firstRow } from "./db";
import { HttpError } from "./http";
import type { Character } from "./models";

export async function shouldRevealSecrets(db: D1Database): Promise<boolean> {
  const row = await firstRow(
    db,
    `SELECT "isRevealedSecrets" FROM "Settings" WHERE "id" = 1`,
  );
  if (!row) {
    throw new HttpError(500, "Settings row is missing");
  }
  const value = row.isRevealedSecrets;
  return value === true || value === 1;
}

export async function hideUrlIfNeeded(
  db: D1Database,
  url: string | null,
  currentUserId: string | undefined,
  authorId: string | null,
): Promise<string | null> {
  if (!url) {
    return url;
  }
  if (await shouldRevealSecrets(db)) {
    return url;
  }
  if (currentUserId && authorId && currentUserId === authorId) {
    return url;
  }
  return "???";
}

export async function hideCharacterNameIfNeeded(
  db: D1Database,
  character: Character | null,
  currentUserId: string | undefined,
  authorId: string | null,
): Promise<Character | null> {
  if (!character) {
    return character;
  }
  if (await shouldRevealSecrets(db)) {
    return character;
  }
  if (currentUserId && authorId && currentUserId === authorId) {
    return character;
  }
  return {
    ...character,
    name: "?".repeat(character.name.length),
  };
}

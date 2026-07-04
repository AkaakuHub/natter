import { describe, expect, it } from "vitest";

import { HttpError } from "./http";
import type { Character } from "./models";
import {
  hideCharacterNameIfNeeded,
  hideUrlIfNeeded,
  shouldRevealSecrets,
} from "./security";

const character: Character = {
  id: 1,
  name: "Secret",
  userId: "user-1",
  postsCount: 0,
  createdAt: "2026-07-04T00:00:00.000Z",
  updatedAt: "2026-07-04T00:00:00.000Z",
};

function createSettingsDb(row: Record<string, unknown> | null): D1Database {
  return {
    prepare: () => ({
      bind: () => ({
        first: async () => row,
      }),
    }),
  } as D1Database;
}

describe("shouldRevealSecrets", () => {
  it("returns true when settings row enables secret reveal", async () => {
    await expect(
      shouldRevealSecrets(createSettingsDb({ isRevealedSecrets: 1 })),
    ).resolves.toBe(true);
    await expect(
      shouldRevealSecrets(createSettingsDb({ isRevealedSecrets: true })),
    ).resolves.toBe(true);
  });

  it("returns false when settings row disables secret reveal", async () => {
    await expect(
      shouldRevealSecrets(createSettingsDb({ isRevealedSecrets: 0 })),
    ).resolves.toBe(false);
    await expect(
      shouldRevealSecrets(createSettingsDb({ isRevealedSecrets: false })),
    ).resolves.toBe(false);
  });

  it("throws HttpError when settings row is missing", async () => {
    await expect(shouldRevealSecrets(createSettingsDb(null))).rejects.toThrow(
      HttpError,
    );
  });
});

describe("hideUrlIfNeeded", () => {
  it("keeps empty URL values unchanged", async () => {
    await expect(
      hideUrlIfNeeded(createSettingsDb({ isRevealedSecrets: 0 }), null, "u", "u"),
    ).resolves.toBeNull();
  });

  it("keeps URLs when secrets are revealed or the current user is the author", async () => {
    await expect(
      hideUrlIfNeeded(
        createSettingsDb({ isRevealedSecrets: 1 }),
        "https://example.com",
        "viewer",
        "author",
      ),
    ).resolves.toBe("https://example.com");
    await expect(
      hideUrlIfNeeded(
        createSettingsDb({ isRevealedSecrets: 0 }),
        "https://example.com",
        "author",
        "author",
      ),
    ).resolves.toBe("https://example.com");
  });

  it("hides URLs from other users when secrets are not revealed", async () => {
    await expect(
      hideUrlIfNeeded(
        createSettingsDb({ isRevealedSecrets: 0 }),
        "https://example.com",
        "viewer",
        "author",
      ),
    ).resolves.toBe("???");
  });
});

describe("hideCharacterNameIfNeeded", () => {
  it("keeps missing characters unchanged", async () => {
    await expect(
      hideCharacterNameIfNeeded(
        createSettingsDb({ isRevealedSecrets: 0 }),
        null,
        "viewer",
        "author",
      ),
    ).resolves.toBeNull();
  });

  it("keeps character names when secrets are revealed or the current user is the author", async () => {
    await expect(
      hideCharacterNameIfNeeded(
        createSettingsDb({ isRevealedSecrets: 1 }),
        character,
        "viewer",
        "author",
      ),
    ).resolves.toEqual(character);
    await expect(
      hideCharacterNameIfNeeded(
        createSettingsDb({ isRevealedSecrets: 0 }),
        character,
        "author",
        "author",
      ),
    ).resolves.toEqual(character);
  });

  it("masks character names with the same length when secrets are not revealed", async () => {
    await expect(
      hideCharacterNameIfNeeded(
        createSettingsDb({ isRevealedSecrets: 0 }),
        character,
        "viewer",
        "author",
      ),
    ).resolves.toEqual({
      ...character,
      name: "??????",
    });
  });
});

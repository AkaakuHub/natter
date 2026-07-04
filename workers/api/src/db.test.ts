import { describe, expect, it } from "vitest";

import {
  allRows,
  booleanValue,
  firstRow,
  numberValue,
  optionalNumberValue,
  optionalStringValue,
  requireRow,
  run,
  stringValue,
} from "./db";
import { HttpError } from "./http";

function createD1Database(result: {
  first?: Record<string, unknown> | null;
  all?: Record<string, unknown>[];
  run?: D1Result;
  calls: { sql: string; params: unknown[] }[];
}): D1Database {
  return {
    prepare: (sql: string) => ({
      bind: (...params: unknown[]) => {
        result.calls.push({ sql, params });
        return {
          first: async () => result.first,
          all: async () => ({ results: result.all ?? [] }),
          run: async () =>
            result.run ?? {
              success: true,
              meta: {},
            },
        };
      },
    }),
  } as D1Database;
}

describe("D1 helpers", () => {
  it("returns the first row and records bound params", async () => {
    const result = {
      first: { id: 1 },
      calls: [] as { sql: string; params: unknown[] }[],
    };
    const db = createD1Database(result);

    await expect(firstRow(db, "SELECT * FROM t WHERE id = ?", 1)).resolves
      .toEqual({ id: 1 });
    expect(result.calls).toEqual([
      { sql: "SELECT * FROM t WHERE id = ?", params: [1] },
    ]);
  });

  it("normalizes missing first rows to undefined", async () => {
    const db = createD1Database({ first: null, calls: [] });

    await expect(firstRow(db, "SELECT 1")).resolves.toBeUndefined();
  });

  it("returns all rows and run results", async () => {
    const calls: { sql: string; params: unknown[] }[] = [];
    const db = createD1Database({
      all: [{ id: 1 }, { id: 2 }],
      run: { success: true, meta: { duration: 1 } },
      calls,
    });

    await expect(allRows(db, "SELECT * FROM t")).resolves.toEqual([
      { id: 1 },
      { id: 2 },
    ]);
    await expect(run(db, "DELETE FROM t WHERE id = ?", 1)).resolves.toEqual({
      success: true,
      meta: { duration: 1 },
    });
    expect(calls).toEqual([
      { sql: "SELECT * FROM t", params: [] },
      { sql: "DELETE FROM t WHERE id = ?", params: [1] },
    ]);
  });
});

describe("row value helpers", () => {
  it("parses required and optional strings", () => {
    expect(stringValue({ name: "Alice" }, "name")).toBe("Alice");
    expect(optionalStringValue({ name: undefined }, "name")).toBeNull();
    expect(optionalStringValue({ name: null }, "name")).toBeNull();
    expect(optionalStringValue({ name: "Alice" }, "name")).toBe("Alice");
  });

  it("parses required and optional numbers", () => {
    expect(numberValue({ count: 1 }, "count")).toBe(1);
    expect(optionalNumberValue({ count: undefined }, "count")).toBeNull();
    expect(optionalNumberValue({ count: null }, "count")).toBeNull();
    expect(optionalNumberValue({ count: 1 }, "count")).toBe(1);
  });

  it("parses booleans from boolean and number values", () => {
    expect(booleanValue({ value: true }, "value")).toBe(true);
    expect(booleanValue({ value: false }, "value")).toBe(false);
    expect(booleanValue({ value: 1 }, "value")).toBe(true);
    expect(booleanValue({ value: 0 }, "value")).toBe(false);
  });

  it("throws explicit errors for invalid row values", () => {
    expect(() => stringValue({ name: 1 }, "name")).toThrow(
      "name must be string",
    );
    expect(() => optionalStringValue({ name: 1 }, "name")).toThrow(
      "name must be string or null",
    );
    expect(() => numberValue({ count: "1" }, "count")).toThrow(
      "count must be number",
    );
    expect(() => optionalNumberValue({ count: "1" }, "count")).toThrow(
      "count must be number or null",
    );
    expect(() => booleanValue({ value: "true" }, "value")).toThrow(
      "value must be boolean",
    );
  });
});

describe("requireRow", () => {
  it("parses existing rows", () => {
    expect(requireRow({ id: 1 }, (row) => numberValue(row, "id"), "missing"))
      .toBe(1);
  });

  it("throws 404 HttpError for missing rows", () => {
    expect(() => requireRow(undefined, () => 1, "missing")).toThrow(HttpError);
    expect(() => requireRow(undefined, () => 1, "missing")).toThrow("missing");
  });
});

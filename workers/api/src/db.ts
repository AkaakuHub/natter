import { HttpError } from "./http";

export type Row = Record<string, unknown>;

export async function firstRow(
  db: D1Database,
  sql: string,
  ...params: unknown[]
): Promise<Row | undefined> {
  const row = await db
    .prepare(sql)
    .bind(...params)
    .first<Row>();
  return row ?? undefined;
}

export async function allRows(
  db: D1Database,
  sql: string,
  ...params: unknown[]
): Promise<Row[]> {
  const result = await db
    .prepare(sql)
    .bind(...params)
    .all<Row>();
  return result.results;
}

export async function run(
  db: D1Database,
  sql: string,
  ...params: unknown[]
): Promise<D1Result> {
  return db
    .prepare(sql)
    .bind(...params)
    .run();
}

export function requireRow<T>(
  row: Row | undefined,
  parser: (row: Row) => T,
  message: string,
): T {
  if (!row) {
    throw new HttpError(404, message);
  }
  return parser(row);
}

export function stringValue(row: Row, key: string): string {
  const value = row[key];
  if (typeof value !== "string") {
    throw new Error(`${key} must be string`);
  }
  return value;
}

export function optionalStringValue(row: Row, key: string): string | null {
  const value = row[key];
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== "string") {
    throw new Error(`${key} must be string or null`);
  }
  return value;
}

export function numberValue(row: Row, key: string): number {
  const value = row[key];
  if (typeof value !== "number") {
    throw new Error(`${key} must be number`);
  }
  return value;
}

export function optionalNumberValue(row: Row, key: string): number | null {
  const value = row[key];
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== "number") {
    throw new Error(`${key} must be number or null`);
  }
  return value;
}

export function booleanValue(row: Row, key: string): boolean {
  const value = row[key];
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value !== 0;
  }
  throw new Error(`${key} must be boolean`);
}

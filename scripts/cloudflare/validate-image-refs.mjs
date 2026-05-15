#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const databasePath = process.argv[2] ?? "backend/prisma/dev.db";
const uploadsPath = process.argv[3] ?? "backend/uploads";

if (!existsSync(databasePath)) {
  throw new Error(`Database file does not exist: ${databasePath}`);
}

if (!existsSync(uploadsPath)) {
  throw new Error(`Uploads directory does not exist: ${uploadsPath}`);
}

const sqliteOutput = execFileSync(
  "sqlite3",
  [
    "-json",
    databasePath,
    "SELECT id, images FROM Post WHERE images IS NOT NULL AND images != '';",
  ],
  { encoding: "utf8" },
);

const rows = JSON.parse(sqliteOutput || "[]");
const missingFiles = [];
let imageReferenceCount = 0;

for (const row of rows) {
  if (!isPostImageRow(row)) {
    throw new Error("Unexpected sqlite result shape");
  }

  const imageNames = JSON.parse(row.images);
  if (!Array.isArray(imageNames)) {
    throw new Error(`Post ${row.id} images is not an array`);
  }

  for (const imageName of imageNames) {
    if (typeof imageName !== "string") {
      throw new Error(`Post ${row.id} image name is not a string`);
    }

    if (imageName === "HIDDEN_IMAGE") {
      continue;
    }

    imageReferenceCount += 1;
    const imagePath = path.join(uploadsPath, imageName);
    if (!existsSync(imagePath)) {
      missingFiles.push(`${row.id}: ${imageName}`);
    }
  }
}

if (missingFiles.length > 0) {
  throw new Error(`Missing image files:\n${missingFiles.join("\n")}`);
}

console.log(`Validated ${imageReferenceCount} image references`);

function isPostImageRow(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    Number.isInteger(value.id) &&
    typeof value.images === "string"
  );
}

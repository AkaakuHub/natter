-- AlterTable - Add isAdmin column only if it doesn't exist
-- SQLiteでは IF NOT EXISTS が使えないため、エラーを無視する方法を使用
-- 実際の本番環境では、事前にカラムの存在を確認してください

-- Step 1: Add isAdmin column (既に存在する場合はエラーになりますが、無視してください)
ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Create Settings table only if it doesn't exist
CREATE TABLE IF NOT EXISTS "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY DEFAULT 1,
    "isRevealedSecrets" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Step 3: Insert default settings if not exists
INSERT OR IGNORE INTO "Settings" ("id", "isRevealedSecrets", "createdAt", "updatedAt") 
VALUES (1, false, datetime('now'), datetime('now'));
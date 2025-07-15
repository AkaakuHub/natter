-- CreateTable
CREATE TABLE "UrlMetadataCache" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "image" TEXT,
    "siteName" TEXT,
    "type" TEXT,
    "favicon" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UrlMetadataCache_url_key" ON "UrlMetadataCache"("url");

-- CreateIndex
CREATE INDEX "UrlMetadataCache_url_idx" ON "UrlMetadataCache"("url");

-- CreateIndex
CREATE INDEX "UrlMetadataCache_expiresAt_idx" ON "UrlMetadataCache"("expiresAt");

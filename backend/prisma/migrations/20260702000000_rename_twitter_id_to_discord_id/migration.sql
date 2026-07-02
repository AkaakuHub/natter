ALTER TABLE "User" RENAME COLUMN "twitterId" TO "discordId";
DROP INDEX IF EXISTS "User_twitterId_key";
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");

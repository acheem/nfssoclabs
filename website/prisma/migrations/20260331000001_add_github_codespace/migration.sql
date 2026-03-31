ALTER TABLE "User" ADD COLUMN "githubToken" TEXT;

CREATE TABLE "Codespace" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "labSlug" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Codespace_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Codespace_name_key" ON "Codespace"("name");
CREATE INDEX "Codespace_userId_idx" ON "Codespace"("userId");
CREATE INDEX "Codespace_labSlug_idx" ON "Codespace"("labSlug");

ALTER TABLE "Codespace" ADD CONSTRAINT "Codespace_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

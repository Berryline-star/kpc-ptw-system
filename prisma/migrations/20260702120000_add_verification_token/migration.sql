-- Prisma's `@default(cuid())` is evaluated client-side (Prisma Client
-- asks for a fresh id per insert) — it isn't a SQL-level DEFAULT the
-- migration engine can push into a single ADD COLUMN step, so it can't
-- auto-backfill existing rows. This migration does it in three safe
-- steps instead: add the column nullable, backfill every existing row
-- with a unique value, then lock it down to NOT NULL + UNIQUE.

-- Step 1: add as nullable
ALTER TABLE "Permit" ADD COLUMN "verificationToken" TEXT;

-- Step 2: backfill each existing row with a unique value. Uses only
-- built-in Postgres functions (no pgcrypto/uuid-ossp extension
-- required). Including the row's own "id" in the hash input guarantees
-- uniqueness even in the (astronomically unlikely) case random() and
-- clock_timestamp() collide across rows.
UPDATE "Permit"
SET "verificationToken" = md5(random()::text || clock_timestamp()::text || "id")
WHERE "verificationToken" IS NULL;

-- Step 3: every row now has a value, so it's safe to enforce the
-- NOT NULL + UNIQUE constraints the schema declares.
ALTER TABLE "Permit" ALTER COLUMN "verificationToken" SET NOT NULL;
CREATE UNIQUE INDEX "Permit_verificationToken_key" ON "Permit"("verificationToken");

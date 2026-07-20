-- Unlike the verificationToken migration, both new columns here are
-- safe to add in one step against existing rows: failedLoginAttempts
-- has a plain integer DEFAULT (a real SQL-level default, not a
-- client-evaluated one like cuid()), and lockedUntil is nullable with
-- no default at all, so every existing row just gets NULL.

ALTER TABLE "User" ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lockedUntil" TIMESTAMP(3);

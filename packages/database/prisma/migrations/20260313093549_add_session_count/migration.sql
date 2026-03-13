-- AlterTable
ALTER TABLE "Session"
ADD COLUMN "count" INTEGER NOT NULL DEFAULT 0;

-- Backfill existing session registration totals
UPDATE "Session" s
SET "count" = COALESCE(sr.registration_count, 0)
FROM (
	SELECT "session_id", COUNT(*)::INTEGER AS registration_count
	FROM "SessionRegistration"
	GROUP BY "session_id"
) sr
WHERE s."id" = sr."session_id";
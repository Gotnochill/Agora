-- Weighted test cases and partial-credit contest standings.
ALTER TABLE "TestCase" ADD COLUMN "points" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "Submission"
ADD COLUMN "earnedPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "possiblePoints" INTEGER NOT NULL DEFAULT 0;

UPDATE "Submission"
SET "earnedPoints" = "passedCount", "possiblePoints" = "totalCount";

ALTER TABLE "ContestSubmission"
ADD COLUMN "earnedPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "possiblePoints" INTEGER NOT NULL DEFAULT 0;

UPDATE "ContestSubmission"
SET "earnedPoints" = "passedCount", "possiblePoints" = "totalCount";

ALTER TABLE "ContestParticipant" ADD COLUMN "score" INTEGER NOT NULL DEFAULT 0;

UPDATE "ContestParticipant" SET "score" = "solvedCount" * 100;
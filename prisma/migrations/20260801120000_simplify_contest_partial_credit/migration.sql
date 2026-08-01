-- All contests use equal credit per test case, so only pass/total counts are needed.
ALTER TABLE "TestCase" DROP COLUMN "points";

ALTER TABLE "Submission"
DROP COLUMN "earnedPoints",
DROP COLUMN "possiblePoints";

ALTER TABLE "ContestSubmission"
DROP COLUMN "earnedPoints",
DROP COLUMN "possiblePoints";
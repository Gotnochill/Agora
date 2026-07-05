-- Everyone now starts at the bottom (Rough) tier and climbs. New members begin
-- at 1000 instead of 1500.
ALTER TABLE "Profile" ALTER COLUMN "contestRating" SET DEFAULT 1000;

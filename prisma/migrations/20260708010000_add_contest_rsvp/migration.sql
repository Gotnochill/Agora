-- CreateTable
CREATE TABLE "ContestRsvp" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContestRsvp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContestRsvp_userId_idx" ON "ContestRsvp"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContestRsvp_contestId_userId_key" ON "ContestRsvp"("contestId", "userId");

-- AddForeignKey
ALTER TABLE "ContestRsvp" ADD CONSTRAINT "ContestRsvp_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestRsvp" ADD CONSTRAINT "ContestRsvp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

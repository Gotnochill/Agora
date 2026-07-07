-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'NUDGE_RECEIVED';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "recipientId" TEXT;

-- CreateIndex
CREATE INDEX "Notification_recipientId_idx" ON "Notification"("recipientId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

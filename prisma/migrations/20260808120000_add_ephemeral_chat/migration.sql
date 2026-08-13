-- Durable conversation metadata with transient store-and-forward payloads.
CREATE TYPE "ChatConversationType" AS ENUM ('DIRECT', 'GROUP');
CREATE TYPE "ChatMemberRole" AS ENUM ('OWNER', 'MEMBER');
CREATE TYPE "ChatReportStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED');
CREATE TYPE "ChatRateLimitScope" AS ENUM ('MESSAGE_SEND', 'CONVERSATION_CREATE');

CREATE TABLE "ChatConversation" (
    "id" TEXT NOT NULL,
    "type" "ChatConversationType" NOT NULL,
    "title" TEXT,
    "directKey" TEXT,
    "createdById" TEXT NOT NULL,
    "lastActivityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatConversation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChatMember" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "ChatMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "lastReadAt" TIMESTAMP(3),

    CONSTRAINT "ChatMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PendingChatMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "clientMessageId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PendingChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChatDelivery" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatDelivery_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChatSendReceipt" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "clientMessageId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatSendReceipt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChatReport" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportedSenderId" TEXT NOT NULL,
    "resolvedById" TEXT,
    "messageId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "note" TEXT,
    "messageCreatedAt" TIMESTAMP(3) NOT NULL,
    "status" "ChatReportStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "ChatReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChatRateLimit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scope" "ChatRateLimitScope" NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatRateLimit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ChatConversation_directKey_key" ON "ChatConversation"("directKey");
CREATE INDEX "ChatConversation_lastActivityAt_idx" ON "ChatConversation"("lastActivityAt");
CREATE INDEX "ChatConversation_createdById_idx" ON "ChatConversation"("createdById");
CREATE UNIQUE INDEX "ChatMember_conversationId_userId_key" ON "ChatMember"("conversationId", "userId");
CREATE INDEX "ChatMember_userId_leftAt_conversationId_idx" ON "ChatMember"("userId", "leftAt", "conversationId");
CREATE UNIQUE INDEX "PendingChatMessage_senderId_clientMessageId_key" ON "PendingChatMessage"("senderId", "clientMessageId");
CREATE INDEX "PendingChatMessage_conversationId_createdAt_id_idx" ON "PendingChatMessage"("conversationId", "createdAt", "id");
CREATE INDEX "PendingChatMessage_expiresAt_idx" ON "PendingChatMessage"("expiresAt");
CREATE UNIQUE INDEX "ChatDelivery_messageId_recipientId_key" ON "ChatDelivery"("messageId", "recipientId");
CREATE INDEX "ChatDelivery_recipientId_createdAt_messageId_idx" ON "ChatDelivery"("recipientId", "createdAt", "messageId");
CREATE UNIQUE INDEX "ChatSendReceipt_senderId_clientMessageId_key" ON "ChatSendReceipt"("senderId", "clientMessageId");
CREATE INDEX "ChatSendReceipt_expiresAt_idx" ON "ChatSendReceipt"("expiresAt");
CREATE INDEX "ChatSendReceipt_conversationId_createdAt_idx" ON "ChatSendReceipt"("conversationId", "createdAt");
CREATE UNIQUE INDEX "ChatReport_reporterId_messageId_key" ON "ChatReport"("reporterId", "messageId");
CREATE INDEX "ChatReport_status_createdAt_idx" ON "ChatReport"("status", "createdAt");
CREATE INDEX "ChatReport_conversationId_idx" ON "ChatReport"("conversationId");
CREATE UNIQUE INDEX "ChatRateLimit_userId_scope_key" ON "ChatRateLimit"("userId", "scope");
CREATE INDEX "ChatRateLimit_expiresAt_idx" ON "ChatRateLimit"("expiresAt");

ALTER TABLE "ChatConversation" ADD CONSTRAINT "ChatConversation_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PendingChatMessage" ADD CONSTRAINT "PendingChatMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PendingChatMessage" ADD CONSTRAINT "PendingChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatDelivery" ADD CONSTRAINT "ChatDelivery_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "PendingChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatDelivery" ADD CONSTRAINT "ChatDelivery_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatSendReceipt" ADD CONSTRAINT "ChatSendReceipt_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatSendReceipt" ADD CONSTRAINT "ChatSendReceipt_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatReport" ADD CONSTRAINT "ChatReport_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatReport" ADD CONSTRAINT "ChatReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatReport" ADD CONSTRAINT "ChatReport_reportedSenderId_fkey" FOREIGN KEY ("reportedSenderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatReport" ADD CONSTRAINT "ChatReport_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChatRateLimit" ADD CONSTRAINT "ChatRateLimit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
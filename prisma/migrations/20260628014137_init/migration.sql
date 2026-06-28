-- CreateTable
CREATE TABLE "PriorityItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "urgencyScore" INTEGER NOT NULL,
    "sender" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "preview" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "draftReply" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "threadId" TEXT,
    "channelId" TEXT,
    "phoneNumber" TEXT,
    "replyTo" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AgentLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agent" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "expiresAt" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Stats" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "messagesFiltered" INTEGER NOT NULL DEFAULT 0,
    "draftsGenerated" INTEGER NOT NULL DEFAULT 0,
    "meetingsBlocked" INTEGER NOT NULL DEFAULT 0,
    "alertsFired" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);

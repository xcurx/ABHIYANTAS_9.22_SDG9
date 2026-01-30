-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_REVISION');

-- AlterTable
ALTER TABLE "HackathonStage" ADD COLUMN     "allowLateSubmission" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allowParallel" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "blindJudging" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "deadlineReminderHours" INTEGER[] DEFAULT ARRAY[24, 6, 1]::INTEGER[],
ADD COLUMN     "dependsOnStageId" TEXT,
ADD COLUMN     "eliminationNotes" TEXT,
ADD COLUMN     "judgingCriteria" JSONB,
ADD COLUMN     "lateSubmissionPenalty" DOUBLE PRECISION,
ADD COLUMN     "maxSlotsPerTeam" INTEGER,
ADD COLUMN     "mentorSlotDuration" INTEGER,
ADD COLUMN     "minJudgesRequired" INTEGER,
ADD COLUMN     "notifyBeforeDeadline" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyOnComplete" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyOnElimination" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyOnStart" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "submissionDeadline" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "StageSubmission" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT,
    "title" TEXT,
    "description" TEXT,
    "content" TEXT,
    "links" JSONB,
    "attachments" JSONB,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isLate" BOOLEAN NOT NULL DEFAULT false,
    "score" DOUBLE PRECISION,
    "feedback" TEXT,
    "judgedAt" TIMESTAMP(3),
    "judgedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StageSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StageTemplate" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "StageType" NOT NULL,
    "color" TEXT,
    "defaultDurationHours" INTEGER NOT NULL DEFAULT 24,
    "settings" JSONB NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StageSubmission_stageId_status_idx" ON "StageSubmission"("stageId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "StageSubmission_stageId_userId_key" ON "StageSubmission"("stageId", "userId");

-- CreateIndex
CREATE INDEX "HackathonStage_hackathonId_order_idx" ON "HackathonStage"("hackathonId", "order");

-- AddForeignKey
ALTER TABLE "HackathonStage" ADD CONSTRAINT "HackathonStage_dependsOnStageId_fkey" FOREIGN KEY ("dependsOnStageId") REFERENCES "HackathonStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageSubmission" ADD CONSTRAINT "StageSubmission_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "HackathonStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageTemplate" ADD CONSTRAINT "StageTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

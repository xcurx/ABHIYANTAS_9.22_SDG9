-- CreateEnum
CREATE TYPE "HackathonRoleType" AS ENUM ('MENTOR', 'JUDGE', 'ORGANIZER', 'VOLUNTEER', 'SPONSOR_REP');

-- CreateEnum
CREATE TYPE "RoleInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'REVOKED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'ROLE';

-- CreateTable
CREATE TABLE "HackathonRole" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "HackathonRoleType" NOT NULL,
    "invitedBy" TEXT,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "status" "RoleInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "canJudgeAllTracks" BOOLEAN NOT NULL DEFAULT true,
    "assignedTrackIds" TEXT[],
    "bio" TEXT,
    "expertise" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HackathonRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HackathonRole_hackathonId_idx" ON "HackathonRole"("hackathonId");

-- CreateIndex
CREATE INDEX "HackathonRole_userId_idx" ON "HackathonRole"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "HackathonRole_hackathonId_userId_role_key" ON "HackathonRole"("hackathonId", "userId", "role");

-- AddForeignKey
ALTER TABLE "HackathonRole" ADD CONSTRAINT "HackathonRole_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "Hackathon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HackathonRole" ADD CONSTRAINT "HackathonRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HackathonRole" ADD CONSTRAINT "HackathonRole_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

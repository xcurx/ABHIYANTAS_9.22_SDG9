-- AlterTable
ALTER TABLE "HackathonRegistration" ADD COLUMN     "dietaryRestrictions" TEXT,
ADD COLUMN     "experience" TEXT,
ADD COLUMN     "lookingForTeam" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "motivation" TEXT,
ADD COLUMN     "portfolioUrl" TEXT,
ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "teamPreferences" TEXT,
ADD COLUMN     "tshirtSize" TEXT;

-- CreateIndex
CREATE INDEX "HackathonRegistration_hackathonId_idx" ON "HackathonRegistration"("hackathonId");

-- CreateIndex
CREATE INDEX "HackathonRegistration_userId_idx" ON "HackathonRegistration"("userId");

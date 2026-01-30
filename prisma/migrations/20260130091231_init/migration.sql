-- CreateEnum
CREATE TYPE "CodingContestStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'REGISTRATION_OPEN', 'LIVE', 'ENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ContestVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'INVITE_ONLY', 'ORGANIZATION_ONLY');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'CODING', 'MULTIPLE_SELECT', 'SHORT_ANSWER');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EXPERT');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('REGISTERED', 'CHECKED_IN', 'IN_PROGRESS', 'SUBMITTED', 'DISQUALIFIED', 'ABSENT');

-- CreateEnum
CREATE TYPE "ViolationType" AS ENUM ('TAB_SWITCH', 'WINDOW_BLUR', 'COPY_ATTEMPT', 'PASTE_ATTEMPT', 'RIGHT_CLICK', 'FULLSCREEN_EXIT', 'DEVTOOLS_OPEN', 'SCREEN_CAPTURE_ATTEMPT', 'MULTIPLE_DISPLAYS', 'SUSPICIOUS_BEHAVIOR', 'IDLE_TIMEOUT');

-- CreateEnum
CREATE TYPE "TestCaseStatus" AS ENUM ('PENDING', 'RUNNING', 'PASSED', 'FAILED', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR');

-- CreateTable
CREATE TABLE "CodingContest" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "bannerImage" TEXT,
    "rules" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" "CodingContestStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "ContestVisibility" NOT NULL DEFAULT 'PUBLIC',
    "maxParticipants" INTEGER,
    "allowLateJoin" BOOLEAN NOT NULL DEFAULT false,
    "shuffleQuestions" BOOLEAN NOT NULL DEFAULT true,
    "showLeaderboard" BOOLEAN NOT NULL DEFAULT true,
    "showScoresDuring" BOOLEAN NOT NULL DEFAULT false,
    "proctorEnabled" BOOLEAN NOT NULL DEFAULT true,
    "fullScreenRequired" BOOLEAN NOT NULL DEFAULT true,
    "tabSwitchLimit" INTEGER NOT NULL DEFAULT 3,
    "copyPasteDisabled" BOOLEAN NOT NULL DEFAULT true,
    "webcamRequired" BOOLEAN NOT NULL DEFAULT false,
    "negativeMarking" BOOLEAN NOT NULL DEFAULT false,
    "negativePercent" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "partialScoring" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodingContest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodingQuestion" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "points" INTEGER NOT NULL DEFAULT 100,
    "order" INTEGER NOT NULL DEFAULT 0,
    "timeLimit" INTEGER,
    "memoryLimit" INTEGER,
    "options" JSONB,
    "allowMultiple" BOOLEAN NOT NULL DEFAULT false,
    "starterCode" JSONB,
    "solutionCode" JSONB,
    "constraints" TEXT,
    "inputFormat" TEXT,
    "outputFormat" TEXT,
    "sampleInput" TEXT,
    "sampleOutput" TEXT,
    "explanation" TEXT,
    "hints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CodingQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodingTestCase" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "isSample" BOOLEAN NOT NULL DEFAULT false,
    "points" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    "explanation" TEXT,

    CONSTRAINT "CodingTestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContestParticipant" (
    "id" TEXT NOT NULL,
    "contestId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'REGISTERED',
    "startedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),
    "tabSwitchCount" INTEGER NOT NULL DEFAULT 0,
    "isDisqualified" BOOLEAN NOT NULL DEFAULT false,
    "disqualifyReason" TEXT,
    "totalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "questionsAttempted" INTEGER NOT NULL DEFAULT 0,
    "questionsCorrect" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "percentile" DOUBLE PRECISION,
    "browserInfo" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContestParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionSubmission" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "selectedOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "code" TEXT,
    "language" TEXT,
    "isCorrect" BOOLEAN,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "testCasesPassed" INTEGER NOT NULL DEFAULT 0,
    "testCasesTotal" INTEGER NOT NULL DEFAULT 0,
    "executionTime" DOUBLE PRECISION,
    "memoryUsed" DOUBLE PRECISION,
    "compileError" TEXT,
    "runtimeError" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestCaseResult" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "testCaseIndex" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "actualOutput" TEXT,
    "expectedOutput" TEXT,
    "executionTime" DOUBLE PRECISION,
    "memoryUsed" DOUBLE PRECISION,
    "status" "TestCaseStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,

    CONSTRAINT "TestCaseResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProctorViolation" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "type" "ViolationType" NOT NULL,
    "details" TEXT,
    "screenshotUrl" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProctorViolation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodingContest_slug_key" ON "CodingContest"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ContestParticipant_contestId_userId_key" ON "ContestParticipant"("contestId", "userId");

-- AddForeignKey
ALTER TABLE "CodingContest" ADD CONSTRAINT "CodingContest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodingQuestion" ADD CONSTRAINT "CodingQuestion_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "CodingContest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodingTestCase" ADD CONSTRAINT "CodingTestCase_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CodingQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestParticipant" ADD CONSTRAINT "ContestParticipant_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "CodingContest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContestParticipant" ADD CONSTRAINT "ContestParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSubmission" ADD CONSTRAINT "QuestionSubmission_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "ContestParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionSubmission" ADD CONSTRAINT "QuestionSubmission_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CodingQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCaseResult" ADD CONSTRAINT "TestCaseResult_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "QuestionSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProctorViolation" ADD CONSTRAINT "ProctorViolation_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "ContestParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

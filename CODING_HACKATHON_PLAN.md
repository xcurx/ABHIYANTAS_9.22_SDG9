# Competitive Coding Hackathon Module - Implementation Plan

## 📋 Overview

This module adds competitive coding hackathon functionality to the virtual hackathon platform. It enables organizers to create coding contests with:

- MCQ Questions with multiple choice answers
- Coding Problems with test cases and code execution
- Proctored Environment to prevent cheating
- Real-time Leaderboards and scoring
- Integrated Code IDE (Monaco Editor)

---

## 🎯 Module Scope (Non-conflicting with existing codebase)

### New Database Models (Prefix: `Coding*` to avoid conflicts)

All new models are prefixed with `Coding` to ensure no conflicts with existing hackathon models.

### New Route Structure

```
app/
  coding-contests/                    # Main listing page
    page.tsx
    new/                              # Create new contest
      page.tsx
    [contestId]/                      # Contest details
      page.tsx
      manage/                         # Organizer management
        page.tsx
        questions/                    # Question management
          page.tsx
          new/                        # Add new question
            page.tsx
          [questionId]/              # Edit question
            page.tsx
        settings/
          page.tsx
      participate/                    # Participant view
        page.tsx
      leaderboard/
        page.tsx
      results/
        page.tsx
```

---

## 🗄️ Database Schema (New Models)

### Core Models

```prisma
// ==================== CODING CONTEST ====================

model CodingContest {
  id                String              @id @default(cuid())
  organizationId    String
  title             String
  slug              String              @unique
  description       String?
  bannerImage       String?
  rules             String?

  // Timing
  startTime         DateTime
  endTime           DateTime
  duration          Int                 // Duration in minutes

  // Configuration
  status            CodingContestStatus @default(DRAFT)
  visibility        ContestVisibility   @default(PUBLIC)
  maxParticipants   Int?
  allowLateJoin     Boolean             @default(false)
  shuffleQuestions  Boolean             @default(true)
  showLeaderboard   Boolean             @default(true)

  // Proctoring Settings
  proctorEnabled      Boolean           @default(true)
  fullScreenRequired  Boolean           @default(true)
  tabSwitchLimit      Int               @default(3)
  copyPasteDisabled   Boolean           @default(true)
  webcamRequired      Boolean           @default(false)
  screenRecording     Boolean           @default(false)

  // Scoring
  negativeMaking    Boolean             @default(false)
  negativePercent   Float               @default(25)

  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  // Relations
  questions         CodingQuestion[]
  participants      ContestParticipant[]
  organization      Organization        @relation(fields: [organizationId], references: [id])
}

model CodingQuestion {
  id              String            @id @default(cuid())
  contestId       String
  type            QuestionType
  title           String
  description     String            // Rich text / Markdown
  difficulty      Difficulty        @default(MEDIUM)
  points          Int               @default(100)
  order           Int               @default(0)
  timeLimit       Int?              // Optional per-question time limit (seconds)

  // For MCQ
  options         Json?             // Array of {id, text, isCorrect}

  // For Coding Questions
  starterCode     Json?             // {language: code} mapping
  testCases       CodingTestCase[]
  constraints     String?
  inputFormat     String?
  outputFormat    String?
  sampleInput     String?
  sampleOutput    String?
  explanation     String?

  // Metadata
  tags            String[]
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  // Relations
  contest         CodingContest     @relation(fields: [contestId], references: [id], onDelete: Cascade)
  submissions     QuestionSubmission[]
}

model CodingTestCase {
  id          String    @id @default(cuid())
  questionId  String
  input       String
  output      String
  isHidden    Boolean   @default(false)  // Hidden test cases
  points      Int       @default(0)       // Partial scoring
  order       Int       @default(0)

  question    CodingQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
}

model ContestParticipant {
  id            String              @id @default(cuid())
  contestId     String
  userId        String
  status        ParticipantStatus   @default(REGISTERED)
  startedAt     DateTime?
  submittedAt   DateTime?

  // Proctoring Data
  tabSwitches       Int             @default(0)
  violations        ProctorViolation[]
  isDisqualified    Boolean         @default(false)
  disqualifyReason  String?

  // Scoring
  totalScore    Float               @default(0)
  rank          Int?

  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  // Relations
  contest       CodingContest       @relation(fields: [contestId], references: [id], onDelete: Cascade)
  user          User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  submissions   QuestionSubmission[]

  @@unique([contestId, userId])
}

model QuestionSubmission {
  id              String            @id @default(cuid())
  participantId   String
  questionId      String

  // MCQ Answer
  selectedOption  String?

  // Coding Answer
  code            String?
  language        String?

  // Results
  isCorrect       Boolean?
  score           Float             @default(0)
  testCasesPassed Int               @default(0)
  testCasesTotal  Int               @default(0)
  executionTime   Float?            // ms
  memoryUsed      Float?            // MB

  submittedAt     DateTime          @default(now())

  // Relations
  participant     ContestParticipant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  question        CodingQuestion     @relation(fields: [questionId], references: [id], onDelete: Cascade)
  testResults     TestCaseResult[]
}

model TestCaseResult {
  id              String    @id @default(cuid())
  submissionId    String
  testCaseId      String
  passed          Boolean
  actualOutput    String?
  executionTime   Float?
  memoryUsed      Float?
  error           String?

  submission      QuestionSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
}

model ProctorViolation {
  id              String          @id @default(cuid())
  participantId   String
  type            ViolationType
  details         String?
  timestamp       DateTime        @default(now())

  participant     ContestParticipant @relation(fields: [participantId], references: [id], onDelete: Cascade)
}

// ==================== ENUMS ====================

enum CodingContestStatus {
  DRAFT
  PUBLISHED
  LIVE
  ENDED
  CANCELLED
}

enum ContestVisibility {
  PUBLIC
  PRIVATE
  INVITE_ONLY
}

enum QuestionType {
  MCQ
  CODING
  MULTIPLE_SELECT
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
  EXPERT
}

enum ParticipantStatus {
  REGISTERED
  IN_PROGRESS
  SUBMITTED
  DISQUALIFIED
}

enum ViolationType {
  TAB_SWITCH
  COPY_PASTE
  RIGHT_CLICK
  FULLSCREEN_EXIT
  DEVTOOLS_OPEN
  SCREEN_CAPTURE
  MULTIPLE_DISPLAYS
  SUSPICIOUS_BEHAVIOR
}
```

---

## 🔧 Features Implementation

### 1. Contest Management (Organizer)

- Create/Edit/Delete coding contests
- Set timing, rules, and proctoring settings
- Manage questions (MCQ + Coding)
- View participant submissions
- Export results

### 2. Question Management

- Add MCQ questions with multiple options
- Add Coding questions with:
  - Problem statement (Markdown)
  - Starter code (multi-language)
  - Test cases (visible + hidden)
  - Constraints and examples
- Reorder questions
- Bulk import questions

### 3. Code Execution Engine

- Monaco Editor integration
- Multi-language support (Python, JavaScript, C++, Java, C)
- Run against test cases
- Memory and time limits
- Sandboxed execution (via external API like Judge0)

### 4. Proctoring System

- Full-screen enforcement
- Tab switch detection and limit
- Copy/paste prevention
- Right-click disable
- DevTools detection
- Violation logging

### 5. Participant Experience

- Register for contests
- Join contest at start time
- View questions
- Submit answers
- Real-time timer
- View results after submission

### 6. Leaderboard & Results

- Real-time leaderboard
- Score calculation
- Rank assignment
- Detailed results view

---

## 📁 File Structure

```
lib/
  actions/
    coding-contest.ts           # Server actions for contests
    coding-question.ts          # Server actions for questions
    coding-submission.ts        # Server actions for submissions
    coding-proctor.ts           # Proctoring actions
  validations/
    coding-contest.ts           # Zod schemas
    coding-question.ts

app/
  coding-contests/
    page.tsx                    # Browse contests
    new/
      page.tsx                  # Create contest wizard
    [contestId]/
      page.tsx                  # Contest details
      register/
        page.tsx                # Registration
      participate/
        page.tsx                # Contest taking UI
      leaderboard/
        page.tsx
      results/
        page.tsx
      manage/
        page.tsx                # Dashboard
        questions/
          page.tsx              # List questions
          new/
            page.tsx            # Add question
          [questionId]/
            page.tsx            # Edit question
        participants/
          page.tsx              # View participants
        settings/
          page.tsx              # Contest settings

components/
  coding/
    code-editor.tsx             # Monaco wrapper
    mcq-question.tsx
    coding-question.tsx
    timer.tsx
    proctoring-wrapper.tsx
    leaderboard-table.tsx
    test-case-form.tsx
    question-card.tsx
```

---

## 🚀 Implementation Order

1. **Phase 1: Database & Core**
   - Prisma schema additions
   - Validation schemas
   - Basic server actions

2. **Phase 2: Contest Management**
   - Create contest form
   - Contest listing
   - Contest settings

3. **Phase 3: Question System**
   - MCQ question creation
   - Coding question creation
   - Test case management

4. **Phase 4: Code Editor**
   - Monaco Editor component
   - Multi-language support
   - Code execution (Judge0 API)

5. **Phase 5: Proctoring**
   - Proctoring wrapper component
   - Violation detection
   - Logging system

6. **Phase 6: Participant Flow**
   - Registration
   - Contest taking UI
   - Submission system

7. **Phase 7: Results & Leaderboard**
   - Real-time leaderboard
   - Results calculation
   - Export functionality

---

## 🔗 Integration Points

### With Existing Models

- `Organization`: Contests belong to organizations
- `User`: Participants and organizers

### API Routes Needed

- POST `/api/code/execute` - Code execution
- POST `/api/proctor/violation` - Log violations
- GET `/api/contests/[id]/leaderboard` - Real-time leaderboard

---

## 📦 Dependencies to Add

```json
{
  "@monaco-editor/react": "^4.6.0",
  "react-markdown": "^9.0.1",
  "remark-gfm": "^4.0.0"
}
```

---

## ⚡ External Services

### Code Execution

- **Judge0 API** (https://judge0.com/) - Sandboxed code execution
- Self-hosted option available

---

## 🛡️ Security Considerations

1. Rate limiting on submissions
2. Server-side validation of all inputs
3. Sandboxed code execution
4. Proctoring data encryption
5. Access control on all endpoints

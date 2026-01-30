# Virtual Hackathon Platform - Industry-Academia Innovation Hub

## 📋 Project Overview

A comprehensive platform for hosting virtual hackathons that bridge the gap between industry and academia, fostering collaborative innovation, mentorship, and real-world problem solving.

---

## 🎯 Core Objectives

1. **Connect Industry & Academia** - Bridge the gap between corporate challenges and academic research
2. **Virtual-First Experience** - Fully online hackathon experience with real-time collaboration
3. **Skill Development** - Help students gain practical experience on industry problems
4. **Innovation Pipeline** - Create a pathway from hackathon ideas to real-world implementation
5. **Networking** - Enable meaningful connections between students, mentors, and companies

---

## 🏗️ System Architecture

### Tech Stack (Current)
- **Frontend**: Next.js 16, React 19, TailwindCSS 4
- **Backend**: Next.js API Routes / Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Auth.js (NextAuth v5) ✅ Already Implemented
- **Real-time**: WebSockets / Server-Sent Events (To be added)
- **File Storage**: Cloud Storage (AWS S3 / Cloudflare R2)
- **Video Conferencing**: Integration with Jitsi / Daily.co / Zoom API

---

## 👥 User Roles & Permissions

### 1. **Super Admin**
- Full platform management
- Approve/reject organizations
- Platform analytics & reporting
- System configuration

### 2. **Organization Admin** (Company/University)
- Create and manage hackathons
- Invite team members
- Manage organization profile
- View organization analytics

### 3. **Mentor**
- Guide teams during hackathons
- Provide feedback and ratings
- Schedule mentorship sessions
- Access team submissions

### 4. **Judge**
- Evaluate submissions
- Score based on criteria
- Provide feedback
- Participate in winner selection

### 5. **Participant** (Student/Professional)
- Register for hackathons
- Create/join teams
- Submit projects
- Attend workshops & sessions

### 6. **Sponsor**
- View sponsored hackathon progress
- Access talent pool
- Post challenges/bounties
- Recruitment access

---

## 🔧 Feature Modules

### Module 1: Authentication & User Management ✅ (Partially Done)

#### Current Status
- [x] Basic credential authentication
- [x] JWT session management
- [x] Sign-in page

#### To Be Implemented
- [ ] OAuth providers (Google, GitHub, LinkedIn)
- [ ] Email verification
- [ ] Password hashing (bcrypt)
- [ ] Password reset flow
- [ ] Role-based access control (RBAC)
- [ ] User profile management
- [ ] Two-factor authentication (2FA)
- [ ] Session management dashboard

#### Auth.js Callbacks to Update
```typescript
// Extend session with user role
callbacks: {
  session({ session, token }) {
    return {
      ...session,
      user: {
        id: token.id,
        email: session.user?.email,
        name: session.user?.name,
        role: token.role,
        organizationId: token.organizationId,
        avatar: token.avatar,
      }
    }
  },
  jwt({ token, user, trigger, session }) {
    if (user) {
      token.id = user.id;
      token.role = user.role;
      token.organizationId = user.organizationId;
      token.avatar = user.avatar;
    }
    // Handle session update
    if (trigger === "update" && session) {
      token.name = session.name;
      token.avatar = session.avatar;
    }
    return token;
  },
}
```

---

### Module 2: Organization Management

#### Features
- Organization registration & verification
- Company/University profiles
- Team member management
- Department/Division structure
- Branding customization
- Subscription/Plan management

---

### Module 3: Hackathon Management

#### 3.1 Hackathon Creation
- Multi-step hackathon setup wizard
- Hackathon types (Open, Invite-only, Organization-specific)
- Themes & tracks configuration
- Timeline management (Registration, Submission, Judging phases)
- Prize configuration
- Rules & guidelines editor
- Custom registration forms

#### 3.2 Hackathon Discovery
- Browse hackathons (filters: industry, skill level, prize, date)
- Featured/Trending hackathons
- Search functionality
- Recommendation engine
- Hackathon categories/tags
- Save/Bookmark hackathons

#### 3.3 Hackathon Dashboard
- Overview statistics
- Participant management
- Submission tracking
- Announcement system
- Schedule management
- Resource library

#### 3.4 Customizable Hackathon Stages (Pipeline Builder)

**Stage Types:**
| Stage Type | Description | Elimination |
|------------|-------------|-------------|
| `REGISTRATION` | Participant sign-up period | No |
| `TEAM_FORMATION` | Team creation and member recruitment | No |
| `IDEATION` | Idea submission and refinement | Optional |
| `MENTORING_SESSION` | Scheduled mentor interactions | No |
| `CHECKPOINT` | Progress check / milestone review | Optional |
| `DEVELOPMENT` | Active building/coding phase | No |
| `EVALUATION` | Judging round (can be multi-round) | Yes/No |
| `PRESENTATION` | Demo/Pitch to judges | Optional |
| `RESULTS` | Winner announcement | No |
| `CUSTOM` | Organizer-defined stage | Optional |

**Stage Configuration Options:**
- Stage name & description
- Start date & end date
- Duration (auto-calculated or manual)
- Is elimination stage? (Yes/No)
- Elimination criteria (score threshold, top N teams, percentage)
- Required submissions for stage
- Judging criteria (if evaluation stage)
- Mentor availability slots (if mentoring stage)
- Email reminder settings:
  - Before deadline (24h, 12h, 6h, 1h - configurable)
  - Stage start notification
  - Stage end notification
  - Elimination results notification

**Stage Flow Features:**
- Drag-and-drop stage ordering
- Stage dependencies (Stage B requires Stage A completion)
- Parallel stages support
- Stage templates (save & reuse configurations)
- Clone stages from previous hackathons
- Conditional stage activation (based on participant count, etc.)

**Automated Email Notifications:**
| Trigger | Email Type | Timing |
|---------|------------|--------|
| Stage Starting | Reminder | Configurable (1 day, 1 hour before) |
| Deadline Approaching | Warning | 24h, 12h, 6h, 1h before deadline |
| Stage Ended | Summary | Immediately after |
| Elimination Results | Results | After evaluation completion |
| Next Stage Unlocked | Action Required | When previous stage completes |
| Mentoring Session | Booking Confirmation | On booking + reminder before |
| Submission Required | Reminder | If no submission before deadline |

---

### Module 4: Team Management

#### Features
- Team creation & invitations
- Team size limits configuration
- Skill-based team matching
- Team chat & collaboration
- Team profile & portfolio
- Looking for team members board
- Team role assignments (Leader, Developer, Designer, etc.)

---

### Module 5: Problem Statements & Challenges

#### Features
- Industry-posted problem statements
- Challenge categories (AI/ML, Web, Mobile, IoT, Blockchain, etc.)
- Difficulty levels
- Required skills tagging
- Resource attachments
- Dataset provisioning
- API access for challenges

---

### Module 6: Submission System

#### Features
- Project submission portal
- Multiple file uploads (Code, Docs, Videos)
- GitHub/GitLab integration
- Demo video upload/embed
- Presentation slides
- Live demo URL
- Submission versioning
- Plagiarism detection
- Late submission handling

---

### Module 7: Judging & Evaluation

#### Features
- Configurable judging criteria
- Weighted scoring system
- Blind judging option
- Judge assignment algorithm
- Feedback forms
- Multi-round judging
- Live presentation scheduling
- Winner selection workflow
- Appeals process

---

### Module 8: Virtual Collaboration Space

#### 8.1 Real-time Communication
- Team chat rooms
- Direct messaging
- Video conferencing integration
- Screen sharing
- Virtual workspace rooms

#### 8.2 Collaboration Tools
- Shared code editor (Monaco/CodeMirror)
- Whiteboard
- Kanban board for task management
- File sharing
- Version control integration

---

### Module 9: Mentorship System

#### Features
- Mentor registration & profiles
- Expertise tagging
- Availability calendar
- Session booking system
- 1:1 and group mentorship
- Mentorship request queue
- Session feedback & ratings
- Office hours scheduling

---

### Module 10: Events & Sessions

#### Features
- Workshop scheduling
- Webinar integration
- Tech talks
- Networking sessions
- Q&A sessions
- Event calendar
- Session recordings
- Attendance tracking

---

### Module 11: Leaderboard & Gamification

#### Features
- Real-time leaderboards
- Point system
- Badges & achievements
- Skill endorsements
- Participation streaks
- XP levels
- Hall of fame
- Weekly/Monthly challenges

---

### Module 12: Notifications & Announcements

#### Features
- In-app notifications
- Email notifications
- Push notifications
- SMS alerts (optional)
- Announcement broadcasts
- Notification preferences
- Digest emails

---

### Module 13: Analytics & Reporting

#### 13.1 Platform Analytics (Admin)
- User growth metrics
- Hackathon statistics
- Engagement metrics
- Revenue analytics
- Geographic distribution

#### 13.2 Hackathon Analytics (Organizer)
- Registration funnel
- Submission rates
- Engagement tracking
- Participant demographics
- Feedback analysis

#### 13.3 Participant Analytics
- Personal dashboard
- Skill progress
- Participation history
- Achievement showcase

---

### Module 14: Recruitment & Talent Pool

#### Features
- Participant profiles (with consent)
- Skill assessments
- Portfolio showcase
- Company access to talent
- Job/Internship postings
- Direct recruitment channel
- Interview scheduling

---

### Module 15: Sponsorship Management

#### Features
- Sponsor tiers & packages
- Sponsor dashboard
- Brand placement management
- Sponsor communication tools
- ROI tracking
- Lead generation reports

---

### Module 16: Content Management

#### Features
- Blog/News section
- Resource library
- Tutorial content
- FAQ management
- Help center
- Community guidelines

---

### Module 17: Payment & Billing

#### Features
- Registration fee collection
- Prize disbursement
- Sponsor payment processing
- Subscription management
- Invoice generation
- Multiple currency support
- Payment gateway integration (Stripe/Razorpay)

---

## 📊 Database Schema (To Be Updated)

### Core Models

```prisma
// ==================== USER & AUTH ====================

model User {
  id                String    @id @default(cuid())
  email             String    @unique
  emailVerified     DateTime?
  name              String?
  password          String?
  avatar            String?
  bio               String?
  role              UserRole  @default(PARTICIPANT)
  skills            String[]
  linkedinUrl       String?
  githubUrl         String?
  portfolioUrl      String?
  phone             String?
  institution       String?   // University/Company name
  graduationYear    Int?
  isProfileComplete Boolean   @default(false)
  isVerified        Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  organizationMemberships OrganizationMember[]
  teamMemberships         TeamMember[]
  mentorProfile           Mentor?
  judgeAssignments        JudgeAssignment[]
  submissions             Submission[]
  notifications           Notification[]
  messages                Message[]
  sessions                Session[]
  accounts                Account[]
  achievements            UserAchievement[]
  hackathonRegistrations  HackathonRegistration[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  
  @@unique([identifier, token])
}

enum UserRole {
  SUPER_ADMIN
  ORGANIZATION_ADMIN
  MENTOR
  JUDGE
  PARTICIPANT
  SPONSOR
}

// ==================== ORGANIZATION ====================

model Organization {
  id          String           @id @default(cuid())
  name        String
  slug        String           @unique
  type        OrganizationType
  description String?
  logo        String?
  website     String?
  industry    String?
  size        String?
  location    String?
  isVerified  Boolean          @default(false)
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt
  
  // Relations
  members    OrganizationMember[]
  hackathons Hackathon[]
  sponsors   Sponsor[]
}

model OrganizationMember {
  id             String           @id @default(cuid())
  userId         String
  organizationId String
  role           OrgMemberRole    @default(MEMBER)
  joinedAt       DateTime         @default(now())
  
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  @@unique([userId, organizationId])
}

enum OrganizationType {
  COMPANY
  UNIVERSITY
  NONPROFIT
  GOVERNMENT
  OTHER
}

enum OrgMemberRole {
  OWNER
  ADMIN
  MEMBER
}

// ==================== HACKATHON ====================

model Hackathon {
  id                String          @id @default(cuid())
  title             String
  slug              String          @unique
  description       String
  shortDescription  String?
  bannerImage       String?
  thumbnail         String?
  organizationId    String
  type              HackathonType   @default(OPEN)
  mode              HackathonMode   @default(VIRTUAL)
  status            HackathonStatus @default(DRAFT)
  
  // Dates
  registrationStart DateTime
  registrationEnd   DateTime
  hackathonStart    DateTime
  hackathonEnd      DateTime
  judgingStart      DateTime?
  judgingEnd        DateTime?
  resultsDate       DateTime?
  
  // Configuration
  maxTeamSize       Int             @default(4)
  minTeamSize       Int             @default(1)
  maxParticipants   Int?
  registrationFee   Float           @default(0)
  currency          String          @default("USD")
  
  // Content
  rules             String?
  eligibility       String?
  prizePool         Float?
  themes            String[]
  tags              String[]
  
  // Settings
  allowSoloParticipants Boolean @default(true)
  requireApproval       Boolean @default(false)
  isPublic              Boolean @default(true)
  isFeatured            Boolean @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  organization    Organization            @relation(fields: [organizationId], references: [id])
  tracks          Track[]
  stages          HackathonStage[]        // Customizable pipeline stages
  registrations   HackathonRegistration[]
  teams           Team[]
  submissions     Submission[]
  prizes          Prize[]
  sponsors        Sponsor[]
  judges          JudgeAssignment[]
  mentors         HackathonMentor[]
  events          Event[]
  announcements   Announcement[]
  resources       Resource[]
  judgingCriteria JudgingCriteria[]
  faqs            FAQ[]
}

enum HackathonType {
  OPEN
  INVITE_ONLY
  ORGANIZATION_ONLY
}

enum HackathonMode {
  VIRTUAL
  IN_PERSON
  HYBRID
}

enum HackathonStatus {
  DRAFT
  PUBLISHED
  REGISTRATION_OPEN
  REGISTRATION_CLOSED
  IN_PROGRESS
  JUDGING
  COMPLETED
  CANCELLED
}

model Track {
  id           String   @id @default(cuid())
  hackathonId  String
  name         String
  description  String?
  prizeAmount  Float?
  
  hackathon   Hackathon    @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
  submissions Submission[]
}

model Prize {
  id          String  @id @default(cuid())
  hackathonId String
  title       String
  description String?
  amount      Float?
  position    Int     // 1st, 2nd, 3rd, etc.
  trackId     String? // Optional: track-specific prize
  
  hackathon Hackathon @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
}

// ==================== HACKATHON STAGES ====================

model HackathonStage {
  id            String      @id @default(cuid())
  hackathonId   String
  name          String
  description   String?
  type          StageType
  order         Int         // Stage sequence order
  
  // Timing
  startDate     DateTime
  endDate       DateTime
  
  // Elimination Settings
  isElimination     Boolean @default(false)
  eliminationType   EliminationType?
  eliminationValue  Float?  // Top N teams, percentage, or score threshold
  
  // Stage Requirements
  requiresSubmission    Boolean @default(false)
  submissionInstructions String?
  
  // Dependencies
  dependsOnStageId  String? // Previous stage that must complete first
  isParallel        Boolean @default(false) // Can run alongside other stages
  
  // Settings
  isActive      Boolean @default(true)
  isCompleted   Boolean @default(false)
  completedAt   DateTime?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  hackathon           Hackathon @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
  dependsOnStage      HackathonStage? @relation("StageDependency", fields: [dependsOnStageId], references: [id])
  dependentStages     HackathonStage[] @relation("StageDependency")
  emailReminders      StageEmailReminder[]
  stageSubmissions    StageSubmission[]
  stageResults        StageResult[]
  judgingCriteria     StageJudgingCriteria[]
  mentoringSessions   StageMentoringSlot[]
}

enum StageType {
  REGISTRATION
  TEAM_FORMATION
  IDEATION
  MENTORING_SESSION
  CHECKPOINT
  DEVELOPMENT
  EVALUATION
  PRESENTATION
  RESULTS
  CUSTOM
}

enum EliminationType {
  TOP_N_TEAMS       // Keep top N teams
  PERCENTAGE        // Keep top X%
  SCORE_THRESHOLD   // Keep teams above score X
  MANUAL            // Organizer manually selects
}

model StageEmailReminder {
  id            String          @id @default(cuid())
  stageId       String
  triggerType   EmailTriggerType
  triggerOffset Int             // Minutes before/after event
  subject       String
  template      String?         // Custom email template
  isEnabled     Boolean         @default(true)
  lastSentAt    DateTime?
  
  stage HackathonStage @relation(fields: [stageId], references: [id], onDelete: Cascade)
}

enum EmailTriggerType {
  STAGE_START
  STAGE_END
  DEADLINE_REMINDER
  ELIMINATION_RESULTS
  SUBMISSION_REMINDER
  MENTORING_REMINDER
  CUSTOM
}

model StageSubmission {
  id          String   @id @default(cuid())
  stageId     String
  teamId      String
  title       String?
  content     String?  // Text content/description
  fileUrls    String[] // Uploaded files
  links       String[] // External links
  submittedAt DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  stage HackathonStage @relation(fields: [stageId], references: [id], onDelete: Cascade)
  scores StageSubmissionScore[]
  
  @@unique([stageId, teamId])
}

model StageJudgingCriteria {
  id          String @id @default(cuid())
  stageId     String
  name        String
  description String?
  maxScore    Float  @default(10)
  weight      Float  @default(1)
  order       Int    @default(0)
  
  stage  HackathonStage @relation(fields: [stageId], references: [id], onDelete: Cascade)
  scores StageSubmissionScore[]
}

model StageSubmissionScore {
  id                String   @id @default(cuid())
  stageSubmissionId String
  criteriaId        String
  judgeUserId       String
  score             Float
  feedback          String?
  scoredAt          DateTime @default(now())
  
  submission StageSubmission       @relation(fields: [stageSubmissionId], references: [id], onDelete: Cascade)
  criteria   StageJudgingCriteria  @relation(fields: [criteriaId], references: [id], onDelete: Cascade)
  
  @@unique([stageSubmissionId, criteriaId, judgeUserId])
}

model StageResult {
  id          String      @id @default(cuid())
  stageId     String
  teamId      String
  status      StageResultStatus
  totalScore  Float?
  rank        Int?
  feedback    String?
  processedAt DateTime    @default(now())
  
  stage HackathonStage @relation(fields: [stageId], references: [id], onDelete: Cascade)
  
  @@unique([stageId, teamId])
}

enum StageResultStatus {
  QUALIFIED       // Passed to next stage
  ELIMINATED      // Eliminated from hackathon
  PENDING         // Awaiting evaluation
  SKIPPED         // Stage was optional and skipped
}

model StageMentoringSlot {
  id          String   @id @default(cuid())
  stageId     String
  mentorId    String
  startTime   DateTime
  endTime     DateTime
  maxBookings Int      @default(1) // 1 for 1:1, more for group
  meetingUrl  String?
  
  stage    HackathonStage      @relation(fields: [stageId], references: [id], onDelete: Cascade)
  bookings MentoringBooking[]
}

model MentoringBooking {
  id        String        @id @default(cuid())
  slotId    String
  teamId    String
  status    BookingStatus @default(CONFIRMED)
  notes     String?
  rating    Int?          // Post-session rating
  feedback  String?       // Post-session feedback
  bookedAt  DateTime      @default(now())
  
  slot StageMentoringSlot @relation(fields: [slotId], references: [id], onDelete: Cascade)
}

enum BookingStatus {
  CONFIRMED
  CANCELLED
  COMPLETED
  NO_SHOW
}

// Reusable stage templates
model StageTemplate {
  id             String    @id @default(cuid())
  organizationId String?
  name           String
  description    String?
  stageConfig    Json      // Serialized stage configuration
  isPublic       Boolean   @default(false)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

// ==================== REGISTRATION & TEAMS ====================

model HackathonRegistration {
  id           String             @id @default(cuid())
  userId       String
  hackathonId  String
  status       RegistrationStatus @default(PENDING)
  teamId       String?
  appliedAt    DateTime           @default(now())
  approvedAt   DateTime?
  
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  hackathon Hackathon @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
  team      Team?     @relation(fields: [teamId], references: [id])
  
  @@unique([userId, hackathonId])
}

enum RegistrationStatus {
  PENDING
  APPROVED
  REJECTED
  WAITLISTED
  CANCELLED
}

model Team {
  id          String   @id @default(cuid())
  hackathonId String
  name        String
  description String?
  avatar      String?
  inviteCode  String   @unique @default(cuid())
  isLookingForMembers Boolean @default(false)
  lookingForSkills    String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  hackathon     Hackathon               @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
  members       TeamMember[]
  submissions   Submission[]
  registrations HackathonRegistration[]
  chatRoom      ChatRoom?
}

model TeamMember {
  id       String         @id @default(cuid())
  teamId   String
  userId   String
  role     TeamMemberRole @default(MEMBER)
  joinedAt DateTime       @default(now())
  
  team Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([teamId, userId])
}

enum TeamMemberRole {
  LEADER
  MEMBER
}

// ==================== SUBMISSIONS ====================

model Submission {
  id          String           @id @default(cuid())
  hackathonId String
  teamId      String
  trackId     String?
  userId      String           // Submitter
  
  // Project Details
  title       String
  description String
  tagline     String?
  
  // Links
  repoUrl     String?
  demoUrl     String?
  videoUrl    String?
  presentationUrl String?
  
  // Files
  files       SubmissionFile[]
  
  // Metadata
  techStack   String[]
  status      SubmissionStatus @default(DRAFT)
  submittedAt DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  hackathon Hackathon      @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
  team      Team           @relation(fields: [teamId], references: [id], onDelete: Cascade)
  track     Track?         @relation(fields: [trackId], references: [id])
  submitter User           @relation(fields: [userId], references: [id])
  scores    SubmissionScore[]
}

model SubmissionFile {
  id           String  @id @default(cuid())
  submissionId String
  name         String
  url          String
  type         String
  size         Int
  
  submission Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
}

enum SubmissionStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  ACCEPTED
  REJECTED
  WINNER
}

// ==================== JUDGING ====================

model JudgingCriteria {
  id          String @id @default(cuid())
  hackathonId String
  name        String
  description String?
  maxScore    Int    @default(10)
  weight      Float  @default(1)
  order       Int    @default(0)
  
  hackathon Hackathon         @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
  scores    SubmissionScore[]
}

model JudgeAssignment {
  id          String @id @default(cuid())
  hackathonId String
  userId      String
  trackId     String?
  
  hackathon Hackathon         @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
  user      User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  scores    SubmissionScore[]
  
  @@unique([hackathonId, userId])
}

model SubmissionScore {
  id           String @id @default(cuid())
  submissionId String
  judgeId      String
  criteriaId   String
  score        Float
  feedback     String?
  scoredAt     DateTime @default(now())
  
  submission Submission        @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  judge      JudgeAssignment   @relation(fields: [judgeId], references: [id], onDelete: Cascade)
  criteria   JudgingCriteria   @relation(fields: [criteriaId], references: [id], onDelete: Cascade)
  
  @@unique([submissionId, judgeId, criteriaId])
}

// ==================== MENTORSHIP ====================

model Mentor {
  id          String   @id @default(cuid())
  userId      String   @unique
  bio         String?
  expertise   String[]
  company     String?
  title       String?
  isAvailable Boolean  @default(true)
  
  user     User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  hackathons HackathonMentor[]
  sessions   MentorSession[]
  availability MentorAvailability[]
}

model HackathonMentor {
  id          String @id @default(cuid())
  hackathonId String
  mentorId    String
  
  hackathon Hackathon @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
  mentor    Mentor    @relation(fields: [mentorId], references: [id], onDelete: Cascade)
  
  @@unique([hackathonId, mentorId])
}

model MentorAvailability {
  id        String   @id @default(cuid())
  mentorId  String
  dayOfWeek Int      // 0-6
  startTime String   // HH:mm
  endTime   String   // HH:mm
  
  mentor Mentor @relation(fields: [mentorId], references: [id], onDelete: Cascade)
}

model MentorSession {
  id           String        @id @default(cuid())
  mentorId     String
  teamId       String?
  userId       String?       // For 1:1 sessions
  hackathonId  String?
  scheduledAt  DateTime
  duration     Int           // minutes
  status       SessionStatus @default(SCHEDULED)
  meetingUrl   String?
  notes        String?
  rating       Int?
  feedback     String?
  
  mentor Mentor @relation(fields: [mentorId], references: [id], onDelete: Cascade)
}

enum SessionStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}

// ==================== SPONSORS ====================

model Sponsor {
  id             String      @id @default(cuid())
  hackathonId    String
  organizationId String?
  name           String
  logo           String?
  website        String?
  tier           SponsorTier @default(BRONZE)
  description    String?
  
  hackathon    Hackathon     @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
  organization Organization? @relation(fields: [organizationId], references: [id])
}

enum SponsorTier {
  BRONZE
  SILVER
  GOLD
  PLATINUM
  TITLE
}

// ==================== EVENTS & SESSIONS ====================

model Event {
  id          String    @id @default(cuid())
  hackathonId String
  title       String
  description String?
  type        EventType
  startTime   DateTime
  endTime     DateTime
  meetingUrl  String?
  recordingUrl String?
  hostName    String?
  
  hackathon Hackathon @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
}

enum EventType {
  WORKSHOP
  WEBINAR
  NETWORKING
  QA_SESSION
  KEYNOTE
  DEMO
  OTHER
}

// ==================== COMMUNICATION ====================

model Announcement {
  id          String   @id @default(cuid())
  hackathonId String
  title       String
  content     String
  priority    Int      @default(0)
  createdAt   DateTime @default(now())
  
  hackathon Hackathon @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
}

model ChatRoom {
  id       String    @id @default(cuid())
  teamId   String    @unique
  messages Message[]
  
  team Team @relation(fields: [teamId], references: [id], onDelete: Cascade)
}

model Message {
  id         String   @id @default(cuid())
  chatRoomId String
  userId     String
  content    String
  createdAt  DateTime @default(now())
  
  chatRoom ChatRoom @relation(fields: [chatRoomId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  content   String
  type      String
  link      String?
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ==================== RESOURCES ====================

model Resource {
  id          String  @id @default(cuid())
  hackathonId String
  title       String
  description String?
  url         String?
  fileUrl     String?
  type        String  // documentation, dataset, api, tutorial
  
  hackathon Hackathon @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
}

model FAQ {
  id          String @id @default(cuid())
  hackathonId String
  question    String
  answer      String
  order       Int    @default(0)
  
  hackathon Hackathon @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
}

// ==================== GAMIFICATION ====================

model Achievement {
  id          String            @id @default(cuid())
  name        String
  description String
  icon        String?
  points      Int               @default(0)
  criteria    String            // JSON criteria
  
  users UserAchievement[]
}

model UserAchievement {
  id            String   @id @default(cuid())
  userId        String
  achievementId String
  earnedAt      DateTime @default(now())
  
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)
  
  @@unique([userId, achievementId])
}
```

---

## 🗂️ Project Structure

```
cih/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── forgot-password/
│   │   └── verify-email/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── hackathons/
│   │   │   ├── teams/
│   │   │   ├── submissions/
│   │   │   ├── profile/
│   │   │   └── settings/
│   │   └── layout.tsx
│   ├── (platform)/
│   │   ├── hackathons/
│   │   │   ├── page.tsx (Browse)
│   │   │   ├── [slug]/
│   │   │   │   ├── page.tsx (Detail)
│   │   │   │   ├── register/
│   │   │   │   ├── teams/
│   │   │   │   ├── submissions/
│   │   │   │   ├── leaderboard/
│   │   │   │   ├── schedule/
│   │   │   │   └── resources/
│   │   │   └── create/
│   │   ├── organizations/
│   │   ├── mentors/
│   │   └── layout.tsx
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── users/
│   │   │   ├── organizations/
│   │   │   ├── hackathons/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   └── layout.tsx
│   ├── (organizer)/
│   │   └── organizer/
│   │       ├── [hackathonId]/
│   │       │   ├── overview/
│   │       │   ├── participants/
│   │       │   ├── teams/
│   │       │   ├── submissions/
│   │       │   ├── judging/
│   │       │   ├── mentors/
│   │       │   ├── events/
│   │       │   ├── announcements/
│   │       │   └── settings/
│   │       └── layout.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   ├── hackathons/
│   │   ├── teams/
│   │   ├── submissions/
│   │   ├── users/
│   │   ├── upload/
│   │   └── webhooks/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx (Landing)
├── components/
│   ├── ui/
│   ├── forms/
│   ├── hackathon/
│   ├── team/
│   ├── submission/
│   ├── dashboard/
│   └── shared/
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── utils.ts
│   ├── validators/
│   └── services/
├── hooks/
├── types/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
└── ...config files
```

---

## 📅 Development Phases

### Phase 1: Foundation (Weeks 1-3)
- [ ] Complete authentication system
  - [ ] Add password hashing (bcrypt)
  - [ ] Email verification
  - [ ] OAuth providers
  - [ ] Role-based access
- [ ] Update database schema
- [ ] User profile management
- [ ] Organization management
- [ ] Basic UI components (shadcn/ui)

### Phase 2: Core Features (Weeks 4-7)
- [ ] Hackathon CRUD operations
- [ ] Hackathon discovery & search
- [ ] Registration system
- [ ] Team management
- [ ] Basic dashboard

### Phase 3: Collaboration (Weeks 8-10)
- [ ] Submission system
- [ ] File uploads
- [ ] Team chat (real-time)
- [ ] Announcements
- [ ] Notifications

### Phase 4: Judging & Events (Weeks 11-13)
- [ ] Judging system
- [ ] Score management
- [ ] Event scheduling
- [ ] Video conferencing integration
- [ ] Leaderboards

### Phase 5: Mentorship & Advanced (Weeks 14-16)
- [ ] Mentor system
- [ ] Session booking
- [ ] Gamification
- [ ] Analytics dashboard
- [ ] Sponsor management

### Phase 6: Polish & Launch (Weeks 17-18)
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Testing
- [ ] Deployment

---

## 🔐 Security Considerations

1. **Authentication**
   - Implement bcrypt for password hashing
   - Rate limiting on auth endpoints
   - CSRF protection (built into Next.js)
   - Secure session management

2. **Authorization**
   - Role-based access control (RBAC)
   - Resource-level permissions
   - API route protection

3. **Data Protection**
   - Input validation (Zod)
   - SQL injection prevention (Prisma)
   - XSS protection
   - File upload validation

4. **Infrastructure**
   - HTTPS everywhere
   - Environment variable management
   - Regular security updates

---

## 🚀 Deployment Strategy

### Recommended Stack
- **Hosting**: Vercel (Next.js optimized)
- **Database**: Prisma Postgres / Supabase / Neon
- **File Storage**: Cloudflare R2 / AWS S3
- **Email**: Resend / SendGrid
- **Video**: Daily.co / Jitsi Meet
- **Analytics**: Posthog / Mixpanel
- **Monitoring**: Sentry

---

## 📊 Success Metrics

1. **User Engagement**
   - Monthly Active Users (MAU)
   - Registration conversion rate
   - Submission completion rate

2. **Platform Growth**
   - Number of hackathons hosted
   - Total participants
   - Organizations onboarded

3. **Innovation Impact**
   - Projects submitted
   - Industry problems solved
   - Successful mentor sessions

4. **Community**
   - Active mentors
   - Repeat participants
   - Industry partnerships

---

## 🔗 Third-Party Integrations

| Service | Purpose | Priority |
|---------|---------|----------|
| GitHub/GitLab | Code submission | High |
| Google OAuth | Authentication | High |
| Stripe/Razorpay | Payments | Medium |
| SendGrid/Resend | Emails | High |
| Daily.co/Jitsi | Video calls | Medium |
| AWS S3/R2 | File storage | High |
| Sentry | Error tracking | Medium |
| Posthog | Analytics | Low |

---

## 📝 API Endpoints Overview

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-email`

### Hackathons
- `GET /api/hackathons`
- `POST /api/hackathons`
- `GET /api/hackathons/[slug]`
- `PUT /api/hackathons/[id]`
- `DELETE /api/hackathons/[id]`
- `POST /api/hackathons/[id]/register`

### Teams
- `GET /api/teams`
- `POST /api/teams`
- `POST /api/teams/join`
- `PUT /api/teams/[id]`
- `DELETE /api/teams/[id]/members/[userId]`

### Submissions
- `GET /api/submissions`
- `POST /api/submissions`
- `PUT /api/submissions/[id]`
- `POST /api/submissions/[id]/submit`

### Users
- `GET /api/users/me`
- `PUT /api/users/me`
- `GET /api/users/[id]`

---

## ✅ Summary

This platform will serve as a comprehensive solution for:
- **Universities** to engage students in real-world problem solving
- **Companies** to discover talent and innovative solutions
- **Students** to gain experience and build portfolios
- **Mentors** to give back and connect with emerging talent

The modular architecture allows for incremental development while maintaining a clear path to a fully-featured platform.

---

*Last Updated: January 30, 2026*

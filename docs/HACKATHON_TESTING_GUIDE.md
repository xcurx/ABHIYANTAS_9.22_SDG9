# Complete Hackathon Platform Testing Guide

This guide walks you through manually testing the entire hackathon workflow from start to finish.

## Prerequisites

1. **Database Setup**: Ensure PostgreSQL is running and the database is seeded

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

2. **Start Development Server**:

   ```bash
   npm run dev
   ```

3. **Test Accounts**: You'll need multiple user accounts. Create them via the sign-up page or use seeded users.

---

## Part 1: Platform Setup

### 1.1 Create Test Users

Create **at least 4 accounts** with different emails:

| Role          | Email (example)       | Purpose                        |
| ------------- | --------------------- | ------------------------------ |
| Organizer     | organizer@test.com    | Creates and manages hackathons |
| Judge         | judge@test.com        | Evaluates submissions          |
| Mentor        | mentor@test.com       | Provides guidance to teams     |
| Participant 1 | participant1@test.com | Joins and participates         |
| Participant 2 | participant2@test.com | Team member                    |

**Steps:**

1. Go to `/sign-up`
2. Fill in name, email, password
3. Repeat for each test user

### 1.2 Create an Organization

1. Log in as the **Organizer**
2. Go to `/organizations`
3. Click "Create Organization"
4. Fill in:
   - Name: "Test Org"
   - Slug: "test-org"
   - Description: "A test organization"
5. Click "Create"

---

## Part 2: Creating a Hackathon

### 2.1 Create the Hackathon

1. Go to `/hackathons`
2. Click "Create Hackathon" or go to `/hackathons/new`
3. Fill in basic info:
   - **Title**: "Test Hackathon 2026"
   - **Slug**: "test-hackathon-2026"
   - **Tagline**: "Build something amazing"
   - **Description**: Add detailed description
   - **Organization**: Select "Test Org"
   - **Mode**: VIRTUAL or HYBRID
   - **Location**: "Online"

4. Set dates (use future dates):
   - **Registration Start**: Today
   - **Registration End**: 3 days from now
   - **Start Date**: 4 days from now
   - **End Date**: 7 days from now

5. Click "Create Hackathon"

### 2.2 Configure Tracks

1. Go to hackathon manage page: `/hackathons/test-hackathon-2026/manage`
2. Click "Tracks" tab
3. Add tracks:
   - **AI/ML Track**: "Build AI-powered solutions"
   - **Web3 Track**: "Blockchain and decentralized apps"
   - **Social Impact Track**: "Solutions for social good"

### 2.3 Configure Prizes

1. Click "Prizes" tab
2. Add prizes:
   - **Grand Prize**: $5,000
   - **Runner Up**: $2,500
   - **Best Design**: $1,000
   - **People's Choice**: $500

### 2.4 Configure Stages/Timeline

1. Click "Timeline" tab
2. Add stages in order:

| Stage          | Type           | Start   | End     | Description        |
| -------------- | -------------- | ------- | ------- | ------------------ |
| Registration   | REGISTRATION   | Today   | +3 days | Sign up period     |
| Team Formation | TEAM_FORMATION | +1 day  | +4 days | Find teammates     |
| Ideation       | IDEATION       | +4 days | +5 days | Submit ideas       |
| Development    | DEVELOPMENT    | +5 days | +7 days | Build your project |
| Presentation   | PRESENTATION   | +7 days | +7 days | Final demos        |
| Evaluation     | EVALUATION     | +7 days | +8 days | Judging period     |
| Results        | RESULTS        | +8 days | +8 days | Winners announced  |

### 2.5 Publish the Hackathon

1. Click "Settings" tab
2. Change status from "DRAFT" to "PUBLISHED"
3. Save changes

---

## Part 3: Inviting Judges & Mentors

### 3.1 Invite a Judge

1. Stay logged in as **Organizer**
2. Go to `/hackathons/test-hackathon-2026/manage/roles`
3. In the invite form:
   - Enter judge's email: `judge@test.com`
   - Select role: **Judge**
4. Click "Send Invitation"
5. Verify the judge appears in the Judges list with "PENDING" status

### 3.2 Invite a Mentor

1. In the same invite form:
   - Enter mentor's email: `mentor@test.com`
   - Select role: **Mentor**
2. Click "Send Invitation"
3. Verify the mentor appears in the Mentors list with "PENDING" status

### 3.3 Judge Accepts Invitation

1. **Log out** and log in as **Judge**
2. Go to `/notifications` - should see the invitation notification
3. Click on the notification or go to `/hackathons/test-hackathon-2026/roles`
4. Click "Accept Invitation"
5. Should redirect to `/hackathons/test-hackathon-2026/judge` (Judge Dashboard)

### 3.4 Mentor Accepts Invitation

1. **Log out** and log in as **Mentor**
2. Go to `/hackathons/test-hackathon-2026/roles`
3. Click "Accept Invitation"
4. Should redirect to `/hackathons/test-hackathon-2026/mentor` (Mentor Dashboard)

### 3.5 Verify Role Status (Organizer)

1. Log back in as **Organizer**
2. Go to `/hackathons/test-hackathon-2026/manage/roles`
3. Verify both Judge and Mentor now show "ACCEPTED" status

---

## Part 4: Participant Registration

### 4.1 Register as Participant

1. **Log out** and log in as **Participant 1**
2. Go to `/hackathons/test-hackathon-2026`
3. Click "Register Now"
4. Fill registration form:
   - Select a track
   - Answer application questions (if any)
5. Submit registration

### 4.2 Approve Registration (Organizer)

1. Log in as **Organizer**
2. Go to `/hackathons/test-hackathon-2026/manage/participants`
3. Find Participant 1's registration
4. Click "Approve" (if manual approval is required)

### 4.3 Register Second Participant

1. Log in as **Participant 2**
2. Register for the hackathon
3. Have organizer approve if needed

---

## Part 5: Team Formation

### 5.1 Create a Team

1. Log in as **Participant 1**
2. Go to `/hackathons/test-hackathon-2026/teams`
3. Click "Create Team"
4. Fill in:
   - **Team Name**: "Awesome Builders"
   - **Description**: "We build awesome stuff"
5. Submit

### 5.2 Invite Team Member

1. On the team page, click "Invite Member"
2. Enter Participant 2's email
3. Send invitation

### 5.3 Accept Team Invitation

1. Log in as **Participant 2**
2. Go to `/notifications`
3. Accept team invitation

---

## Part 6: Making Submissions

### 6.1 Submit to Ideation Stage

1. Log in as **Participant 1** (team leader)
2. Go to `/hackathons/test-hackathon-2026/stages`
3. Find the "Ideation" stage
4. Click "Submit"
5. Fill in submission:
   - **Title**: "AI-Powered Learning Platform"
   - **Description**: Detailed project idea
   - **Links**: Optional GitHub/demo links
6. Submit

### 6.2 Submit to Development Stage

1. When Development stage is active
2. Go to stages page
3. Submit with:
   - **GitHub Repo**: https://github.com/example/project
   - **Demo Video**: YouTube link
   - **Documentation**: Brief docs

### 6.3 View Your Submission

1. After submitting, go to `/hackathons/test-hackathon-2026/stages/[stageId]/submission`
2. Verify all submission details are displayed correctly

---

## Part 7: Judging Process

### 7.1 Access Judge Dashboard

1. Log in as **Judge**
2. Go to `/hackathons/test-hackathon-2026/judge`
3. Should see evaluation stages and pending submissions

### 7.2 Score a Submission

1. Click on a submission to review
2. Score using the 5 criteria:
   - **Innovation (25%)**: 0-100
   - **Technical Execution (25%)**: 0-100
   - **Design & UX (20%)**: 0-100
   - **Impact & Viability (20%)**: 0-100
   - **Presentation (10%)**: 0-100
3. Add feedback comments
4. Submit score

### 7.3 Verify Scoring

1. Return to judge dashboard
2. Submission should now show as "Scored"
3. Check leaderboard at `/hackathons/test-hackathon-2026/leaderboard`

---

## Part 8: Mentor Activities

### 8.1 Access Mentor Dashboard

1. Log in as **Mentor**
2. Go to `/hackathons/test-hackathon-2026/mentor`
3. View list of teams and mentoring sessions

### 8.2 View Team Details

1. Click on a team to see:
   - Team members
   - Their contact info
   - Submitted work (if any)

---

## Part 9: Results & Announcements

### 9.1 Create Announcement

1. Log in as **Organizer**
2. Go to `/hackathons/test-hackathon-2026/manage/announcements`
3. Create announcement:
   - **Title**: "Winners Announced!"
   - **Content**: "Congratulations to all participants..."
4. Publish

### 9.2 View Final Leaderboard

1. Go to `/hackathons/test-hackathon-2026/leaderboard`
2. View final rankings with podium display
3. See top 3 teams highlighted

---

## Verification Checklist

### ✅ Organization Management

- [ ] Create organization
- [ ] View organization page

### ✅ Hackathon Creation

- [ ] Create hackathon with all details
- [ ] Add tracks
- [ ] Add prizes
- [ ] Configure timeline/stages
- [ ] Publish hackathon

### ✅ Role Management

- [ ] Invite judge
- [ ] Invite mentor
- [ ] Judge accepts invitation
- [ ] Mentor accepts invitation
- [ ] Revoke invitation works
- [ ] Resend invitation works

### ✅ Participant Flow

- [ ] Register for hackathon
- [ ] Registration status updates correctly
- [ ] Create team
- [ ] Invite team members
- [ ] Accept team invitation

### ✅ Submissions

- [ ] Submit to ideation stage
- [ ] Submit to development stage
- [ ] View submissions
- [ ] Edit submissions

### ✅ Judging

- [ ] Judge sees submissions to review
- [ ] Score submission with criteria
- [ ] Feedback saved correctly
- [ ] Leaderboard updates

### ✅ Notifications

- [ ] Role invitations
- [ ] Team invitations
- [ ] Announcements
- [ ] Notification bell shows count

---

## Troubleshooting

### "Registration Closed" when it should be open

- Check that registration start/end dates are set correctly
- Dates use local timezone for comparison

### Prize pool shows $0

- Ensure prizes are added in the Prizes tab
- The displayed value is calculated from actual prizes

### Judge/Mentor can't access dashboard

- Ensure they accepted the invitation at `/hackathons/[slug]/roles`
- Role status must be "ACCEPTED"

### Team member can't submit

- Only team leaders can submit for the team
- Check team member role

### Submissions not showing for judge

- Ensure the current stage is an EVALUATION type
- Check that submissions exist for active stages

---

## Quick Test Commands

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Reseed database
npx prisma db seed

# Check for TypeScript errors
npx tsc --noEmit

# Run linter
npm run lint
```

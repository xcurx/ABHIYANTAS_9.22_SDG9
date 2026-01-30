# Hackathon Platform Testing Guide

This guide walks you through testing the complete hackathon flow end-to-end.

## Prerequisites

1. **Database is running** (Neon PostgreSQL)
2. **Dev server is running**: `npm run dev`
3. **At least 2-3 test user accounts** (for testing team features)

---

## Complete Hackathon Flow Testing

### Phase 1: Organization Setup (Admin/Organizer)

1. **Sign up/Sign in** as an organizer
   - Go to: `http://localhost:3000/sign-up`
   - Create an account with email/password or OAuth

2. **Create an Organization**
   - Go to: `http://localhost:3000/organizations/new`
   - Fill in organization details (name, description, logo)
   - Submit the form

3. **Verify Organization**
   - Go to: `http://localhost:3000/organizations`
   - Click on your organization to view details

---

### Phase 2: Hackathon Creation (Organizer)

1. **Create a New Hackathon**
   - Go to: `http://localhost:3000/hackathons/new`
   - Select your organization
   - Fill in hackathon details:
     - Name, tagline, description
     - Start/End dates
     - Registration start/end dates
     - Prize pool, location, mode (online/offline/hybrid)
     - Team settings (min/max size)

2. **Verify Auto-Status**
   - If registration start date is in the past → Status should be "OPEN"
   - If registration hasn't started → Status should be "DRAFT"

---

### Phase 3: Stage Configuration (Organizer)

1. **Access Manage Dashboard**
   - Go to: `http://localhost:3000/hackathons/{your-hackathon-slug}/manage`

2. **Create Stages**
   - Go to: `http://localhost:3000/hackathons/{your-hackathon-slug}/manage/stages`
   - Click "New Stage"
   - Configure each stage:
     - **Idea Submission Stage**: For initial proposals
     - **Prototype Stage**: For MVP demos
     - **Final Presentation Stage**: For judging

3. **Stage Types to Test**:
   - `SUBMISSION` - File/text uploads
   - `REVIEW` - Judge scoring
   - `PRESENTATION` - Live demos
   - `ELIMINATION` - Round advancement
   - `CUSTOM` - Flexible format

---

### Phase 4: Announcements (Organizer)

1. **Create Announcements**
   - Go to: `http://localhost:3000/hackathons/{your-hackathon-slug}/manage/announcements`
   - Create different types:
     - Priority: `LOW`, `NORMAL`, `HIGH`, `URGENT`
   - Toggle "Notify all participants" for email notifications

2. **View Announcements** (as participant)
   - Go to: `http://localhost:3000/hackathons/{your-hackathon-slug}/announcements`

---

### Phase 5: Participant Registration

1. **Sign out** and sign in as a different user (Participant)

2. **Browse Hackathons**
   - Go to: `http://localhost:3000/hackathons`
   - Use filters (status, mode, dates)

3. **View Hackathon Details**
   - Click on a hackathon card
   - Review details, timeline, requirements

4. **Register for Hackathon**
   - Click "Register" button
   - Fill in registration form (if application required)
   - Submit registration

5. **Check Registration Status**
   - Go to: `http://localhost:3000/dashboard/hackathons`
   - See your registered hackathons

---

### Phase 6: Team Formation

1. **Access Team Page**
   - Go to: `http://localhost:3000/hackathons/{slug}/team`

2. **Create a Team** (Team Leader)
   - Click "Create Team"
   - Enter team name
   - Submit

3. **Invite Team Members**
   - In your team card, use "Invite Member" button
   - Enter team member's email
   - They receive an invitation

4. **Accept Invitation** (Other Users)
   - Sign in as the invited user
   - Go to: `http://localhost:3000/hackathons/{slug}/team`
   - See pending invitation
   - Click "Accept" to join the team

5. **Test Team Management**
   - Leave team
   - Cancel invitations
   - Transfer leadership (if implemented)

---

### Phase 7: Mentor/Judge Invitations (Organizer)

1. **Sign back in as Organizer**

2. **Manage Participants**
   - Go to: `http://localhost:3000/hackathons/{slug}/manage/participants`
   - View all registrations

3. **Invite Mentors/Judges**
   - Use "Invite Mentor" or "Invite Judge" button
   - Enter their email
   - They receive an invitation

4. **Accept Role** (as Mentor/Judge)
   - Sign in as the invited user
   - Check notifications
   - Accept the role

---

### Phase 8: Stage Submissions (Participant)

1. **View Available Stages**
   - Go to hackathon detail page
   - See timeline of stages

2. **Submit to Stage**
   - When a stage is active, click "Submit"
   - Upload files or enter required information
   - Submit before deadline

3. **View Submission Status**
   - Check if submission was received
   - Wait for reviews/scores

---

### Phase 9: Review & Judging (Judge)

1. **Access Review Interface**
   - Sign in as a judge
   - Go to hackathon manage page
   - Access submissions for review

2. **Score Submissions**
   - Review each submission
   - Provide scores based on criteria
   - Add feedback comments

---

### Phase 10: Results & Completion

1. **Advance Participants** (Organizer)
   - Mark participants as advanced/eliminated
   - Move to next stage

2. **Announce Winners**
   - Create final announcement
   - Update hackathon status to COMPLETED

---

## Quick Test Scenarios

### Scenario A: Solo Participant Journey

```
1. Sign up → 2. Browse hackathons → 3. Register → 4. Create team → 5. Submit to stage
```

### Scenario B: Team Collaboration

```
1. User A creates team → 2. Invites User B & C → 3. They accept → 4. Team submits together
```

### Scenario C: Organizer Full Flow

```
1. Create org → 2. Create hackathon → 3. Add stages → 4. Publish → 5. Invite judges → 6. Review submissions
```

---

## Testing Checklist

### Authentication

- [ ] Sign up with email/password
- [ ] Sign in with email/password
- [ ] OAuth sign in (Google/GitHub if configured)
- [ ] Sign out
- [ ] Navbar shows correct user state

### Organizations

- [ ] Create organization
- [ ] View organization list
- [ ] View organization details
- [ ] Edit organization settings

### Hackathons

- [ ] Create hackathon
- [ ] View hackathon list
- [ ] Filter hackathons
- [ ] View hackathon details
- [ ] Register for hackathon
- [ ] View registered hackathons in dashboard

### Stages

- [ ] Create stage
- [ ] Edit stage
- [ ] Delete stage
- [ ] Submit to stage
- [ ] View submissions

### Teams

- [ ] Create team
- [ ] Invite member
- [ ] Accept invitation
- [ ] Decline invitation
- [ ] Leave team
- [ ] Cancel invitation

### Announcements

- [ ] Create announcement
- [ ] View announcements
- [ ] Priority levels display correctly
- [ ] Notifications sent

### Notifications

- [ ] View notifications
- [ ] Mark as read
- [ ] Mark all as read
- [ ] Notification bell shows count

---

## Common Issues & Solutions

### "Missing slug" Error

- Ensure hackathon slug is passed in URLs
- Check that hackathon was created successfully

### Navbar Not Showing User

- Ensure page passes `user` and `signOutAction` props to `<Navbar />`

### Team Features Not Working

- Check if TeamMember and TeamInvitation tables exist
- Run migrations: `npx prisma migrate dev`

### Database Connection Issues

- Verify DATABASE_URL in `.env`
- Check Neon dashboard for connection status

---

## API Testing (Optional)

You can also test APIs directly:

```bash
# Get hackathon stages
GET /api/hackathons/{hackathonId}/stages

# Get announcements
GET /api/hackathons/{hackathonId}/announcements

# Get notifications
GET /api/notifications

# Mark notification as read
PATCH /api/notifications/{notificationId}
```

---

## Performance Testing Tips

1. Create multiple hackathons (5-10)
2. Register 10+ users for a hackathon
3. Create multiple teams
4. Test with many submissions
5. Check page load times

---

Happy Testing! 🚀

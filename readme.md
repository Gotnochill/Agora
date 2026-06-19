# ShardUp Platform

## Core Objective

Create a central platform for the ShardUp community where members can:

- Discover people
- Showcase their work
- Access resources
- Participate in programs
- Stay engaged through community-driven interactions

## Phase 1 - MVP

### 1. Authentication & Roles

Email-based Sign Up / Login with user roles:

- Member
- Admin

Future use cases:
- Event access control
- Hackathon registrations
- Mock interviews
- Exclusive resources

### 2. Member Directory

Each member gets a profile containing:

- Name
- Batch / Branch
- Skills
- Social Links
- Current Projects
- Achievements

Purpose:
- Help members discover and connect with builders in the community
- Make ongoing work visible

### 3. Bookshelf

Community-curated repository of learning resources:

- Books
- Articles
- Courses
- Learning Resources

Categories:
- Development
- Competitive Programming
- AI/ML
- System Design
- Startups
- Productivity

### 4. Session Notes Repository

Central archive for:

- Session Notes
- Workshop Materials
- Speaker Resources
- Recordings & References

Purpose:
- Preserve community knowledge
- Help new members onboard faster

### 5. Achievements Wall

Showcase:

- Internal competition winners
- Hackathon achievements
- Open-source contributions
- Community milestones

Purpose:
- Recognition and motivation
- Visibility for members

### 6. Nudge System

Members can challenge or nudge other members.

Examples:
- "Solve this LeetCode problem"
- "Complete this challenge"
- "Read this article"

Flow:
- User A sends a Nudge
- User B accepts
- Completion gets recorded

Purpose:
- Increase participation
- Create accountability
- Bring group-chat interactions onto the platform

### 7. ShardUp Application Portal

Application form for:

- New Cohorts
- Recruitment Cycles
- Internal Programs

Admin Features:
- Review Applications
- Accept / Reject
- Track Status

## Phase 2 - Future

Competitive Programming Portal:

- 1v1 Duels
- Mock Contests
- Leaderboards
- Challenge Creation
- Internal Rating System

Note: High development effort and not required for MVP validation.

## Local Development

### Auth and Database Setup

The app uses Auth.js with Google OAuth, Prisma, and Postgres for the authentication and registration foundation.

Required environment variables are listed in `.env.example`.

Google OAuth callback URLs:

- Local: `http://localhost:3000/api/auth/callback/google`
- Production: `https://YOUR_DOMAIN/api/auth/callback/google`

Useful commands:

- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run dev`
- `npm run build`

Registration is application-first. Google sign-in creates the user identity, but member access remains gated until the application is approved by an admin.

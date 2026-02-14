# CivicBridge — Hackathon Presentation Guide

**For the judging panel:** This document explains every route in CivicBridge, its **purpose**, **relevance to the problem**, and **how it was implemented** (technologies used).

---

## Tech stack (how we built it)

| Layer | Technology | Why we chose it |
|-------|------------|------------------|
| **Frontend** | Next.js 16 (App Router), React 19 | Server and client components, file-based routing, good DX and performance. |
| **Styling** | Tailwind CSS 4, Shadcn UI (Radix), next-themes | Fast UI, accessible components, dark/light mode out of the box. |
| **State** | Zustand (persist) | Lightweight auth state (user, token) with persistence across refresh. |
| **Backend / API** | Next.js Route Handlers (App Router) | Same repo as frontend; no separate server. |
| **Database** | MongoDB | Document store; flexible schema for issues, comments, surveys, analytics. |
| **ODM** | Mongoose | Models, validation, population (relations), indexes. |
| **Auth** | JWT (jsonwebtoken), bcryptjs | Stateless auth; password hashing; role-based access. |
| **Validation** | Zod | Request body and query validation on API routes. |
| **Maps** | Leaflet + react-leaflet, OpenStreetMap | No API key; markers and map picker for issues. |
| **Charts** | Recharts | Analytics and transparency dashboards. |
| **Images** | Cloudinary (unsigned upload) | Issue photo upload from client. |
| **Notifications** | Sonner (toasts) + in-app list | User feedback and notification list from API. |

---

## 1. Authentication routes

**Purpose:** Secure sign-up, login, and “current user” for role-based access.

**Relevance:** Citizens, officials, journalists, and admins need distinct identities and permissions. Auth is the gate for reporting issues, updating status, and viewing dashboards.

### POST `/api/auth/register`
- **Purpose:** Create a new user (name, email, password, **role**: Resident / Official / Journalist / Admin).
- **Why it matters:** Role at signup drives which dashboard and actions the user sees (e.g. only officials can update issue status).
- **Implementation:** Mongoose `User` model; **bcryptjs** (12 rounds) for password hash; **JWT** signed with `id`, `email`, `role`; returns `user` (no password) + `accessToken`. Duplicate email → 409.

### POST `/api/auth/login`
- **Purpose:** Authenticate with email + password and get a token.
- **Why it matters:** Single entry point for all roles; token used for every protected API call.
- **Implementation:** `User.findOne({ email })`, **bcryptjs** `compare`; on success sign JWT and return `user` + `accessToken`; frontend stores both (e.g. Zustand persist).

### GET `/api/auth/me`
- **Purpose:** Return the current user from the Bearer token (e.g. after refresh).
- **Why it matters:** Navbar, profile, and role-based redirects need up-to-date user without re-login.
- **Implementation:** **jsonwebtoken** `verify`; `User.findById(decoded.id).select("-passwordHash")`; 401 if missing/invalid token or user not found.

---

## 2. Civic issues (core product)

**Purpose:** Let citizens report issues (with location and photos), list/filter them, and let officials update status with a public timeline.

**Relevance:** This is the main civic loop: report → track → government responds → visible to all.

### GET `/api/issues`
- **Purpose:** List issues with optional filters (status, category, department, `createdBy=me`) and pagination.
- **Why it matters:** Powers resident “my issues,” official queue, community feed, and transparency explorer.
- **Implementation:** Mongoose `Issue.find(filter)` with **populate** for `createdById` and `departmentId`; **Vote** and **Comment** count via `countDocuments`; `toResponse()` maps `_id` → `id` and keeps dates; supports `createdBy=me` when user is authenticated.

### POST `/api/issues`
- **Purpose:** Create a new issue (title, description, category, severity, lat/lng, address, optional image URLs).
- **Why it matters:** Core citizen action; every report starts here.
- **Implementation:** **requireAuth** + **requireRole** (RESIDENT or ADMIN); **Zod** `createIssueSchema`; Mongoose `Issue.create`; **IssueImage** bulk insert for `imageUrls`; **IssueTimeline** first entry “Submitted”; returns created issue with populated `createdBy` and images.

### GET `/api/issues/[id]`
- **Purpose:** Single issue with creator, assignee, department, images, vote/comment counts, and `userVoted` when logged in.
- **Why it matters:** Detail page and public view need one source of truth; `userVoted` drives “Vote” vs “Remove vote” in UI.
- **Implementation:** **Mongoose** `findById` + **populate** `createdById`, `assignedToId`, `departmentId`; separate counts for votes/comments; if authenticated, **Vote.findOne** for `userVoted`; response normalized with `createdBy` / `assignedTo` / `department` for frontend.

### PATCH `/api/issues/[id]`
- **Purpose:** Update issue (status, assignee, department, optional note); creates a timeline entry.
- **Why it matters:** Officials close the loop; every status change is auditable.
- **Implementation:** **requireRole** (OFFICIAL or ADMIN); **Zod** `updateIssueSchema`; **findByIdAndUpdate**; **IssueTimeline.create** for new status + note; returns updated issue with same shape as GET.

### GET `/api/issues/trending`
- **Purpose:** Issues sorted by vote count and recency (excluding Resolved/Verified).
- **Why it matters:** Home page and community “trending” show what citizens care about most.
- **Implementation:** **Issue.find** with `status` not in Resolved/Verified; per-issue **Vote** and **Comment** counts; sort by votes then `createdAt`; limit; `toResponse` + `createdBy`/`department` mapping.

### GET `/api/issues/nearby`
- **Purpose:** Issues within a radius (km) of a lat/lng (approximate box).
- **Why it matters:** Map view and “report here” need “what’s near me”; no PostGIS required.
- **Implementation:** **Zod** for `lat`, `lng`, `radiusKm`, `limit`; simple geo box (`latitude`/`longitude` in range); **populate** and counts; used by dashboard map and official heatmap.

---

## 3. Engagement (comments, votes, timeline)

**Purpose:** Discussion and prioritization around issues, plus a public audit trail of status changes.

**Relevance:** Comments build accountability; votes surface priority; timeline builds trust.

### GET `/api/comments`
- **Purpose:** Comments for an issue, as a tree (top-level + `replies`).
- **Why it matters:** Enables discussion under each issue; nested structure supports threads.
- **Implementation:** **Comment.find({ issueId })**; **populate** `authorId`; build tree (topLevel vs byParent); **toResponse** and map `authorId` → `author`.

### POST `/api/comments`
- **Purpose:** Add a comment (issueId, body, optional parentId).
- **Why it matters:** Citizens and officials can communicate on the same issue.
- **Implementation:** **requireAuth**; **Zod** schema; **Comment.create** with `authorId`; return created comment with **populate** `authorId` → `author`.

### POST `/api/votes`
- **Purpose:** Toggle vote (upvote) on an issue for the current user.
- **Why it matters:** Community-driven priority; one vote per user per issue.
- **Implementation:** **requireAuth**; **Vote.findOne** (issueId + userId); if exists **deleteOne**, else **create**; returns `{ voted: true/false }`.

### GET `/api/timeline`
- **Purpose:** Status history for an issue (who changed what and when).
- **Why it matters:** Transparency and accountability; every status change is visible.
- **Implementation:** **IssueTimeline.find({ issueId })**; **populate** `updatedById`; **toResponse** (with Date preserved); map `updatedById` → `updatedBy` for UI.

---

## 4. Notifications

**Purpose:** In-app list of notifications (status updates, comments, etc.) and mark-as-read.

**Relevance:** Keeps users informed without leaving the app.

### GET `/api/notifications`
- **Purpose:** List notifications for the current user (optional unread-only, limit).
- **Why it matters:** Navbar dropdown and notifications page need this list.
- **Implementation:** **requireAuth**; **Notification.find({ userId })**; sort by `createdAt` desc; **toResponse**.

### PATCH `/api/notifications/[id]/read`
- **Purpose:** Mark one notification as read.
- **Why it matters:** Cleans up “unread” state and badge.
- **Implementation:** **requireAuth**; **findOne** by `_id` and `userId`; **updateOne** `read: true`; **await params** for Next.js 15+ dynamic segment.

---

## 5. Analytics and departments

**Purpose:** Aggregate stats and department list for dashboards and transparency.

**Relevance:** Officials need metrics; transparency and leaderboards need department data.

### GET `/api/analytics`
- **Purpose:** Aggregates: total issues, last 30 days, counts by status, by category, by department.
- **Why it matters:** Powers official dashboard, SLA view, and transparency overview/charts.
- **Implementation:** **Mongoose** **aggregate** (`$group` by status/category/departmentId); **Issue.countDocuments** for total and last-30-days; **Department.find** for names; returns objects keyed by status/category and array for departments.

### GET `/api/departments`
- **Purpose:** List all departments (name, slug, city, description).
- **Why it matters:** Dropdowns (e.g. assign issue), filters, and transparency leaderboard.
- **Implementation:** **Department.find().sort({ name: 1 })**; **toResponse**; public (no auth).

---

## 6. Surveys

**Purpose:** Let officials create surveys and citizens respond; results are aggregated per question.

**Relevance:** Feedback loop for public services; data for decision-making.

### GET `/api/surveys`
- **Purpose:** List surveys. For public: only published and not ended; for Official/Admin: all.
- **Why it matters:** Public survey list and official “manage surveys” view.
- **Implementation:** **getCurrentUser**; filter by `published` and `endsAt` when not official/admin; **Survey.find** with **populate** questions; **SurveyResponse.countDocuments** per survey for `_count.responses`.

### GET `/api/surveys/[id]`
- **Purpose:** Single survey with questions (for respond page).
- **Why it matters:** Form needs question text and options.
- **Implementation:** **Survey.findById(id).populate("questions")**; 404 if not found or not published/ended; **toResponse**; **await params** for dynamic segment.

### POST `/api/surveys/[id]/respond`
- **Purpose:** Submit answers for the current user (array of questionId + value).
- **Why it matters:** Citizen feedback is stored and then shown in results.
- **Implementation:** **requireAuth**; check survey exists, published, not ended; **Zod** for answers; **findOneAndUpdate** with **upsert** per question so one response per user per question; **await params**.

### GET `/api/surveys/[id]/results`
- **Purpose:** Aggregated results per question (option counts, total responses).
- **Why it matters:** Officials and transparency view see outcomes; journalists can cite.
- **Implementation:** **Survey.findById** + questions; **SurveyResponse.find({ surveyId })**; group by questionId; for each question build options/counts; return `byQuestion`, `totalResponses`.

---

## 7. Frontend routes (summary for judges)

- **Public:** `/`, `/about`, `/how-it-works`, `/features`, `/contact` (marketing and trust); `/community`, `/community/trending`, `/community/discussions`, `/community/issues/[id]` (public issue explorer); `/surveys`, `/surveys/[id]`, `/surveys/[id]/results` (surveys and results).
- **Auth:** `/login`, `/register` (role selection) — JWT stored in Zustand, used in `lib/api.js` for Bearer header.
- **Resident:** `/dashboard` (overview), `/dashboard/issues`, `/dashboard/issues/new` (form + Cloudinary + Leaflet map picker), `/dashboard/issues/[id]` (detail, timeline, comments, vote), `/dashboard/map` (Leaflet + nearby API), `/dashboard/tracking`, `/dashboard/community`, `/dashboard/notifications`, `/dashboard/my-impact`.
- **Official:** `/official`, `/official/issues`, `/official/issues/[id]` (status/note update), `/official/heatmap` (Leaflet + issues), `/official/sla`, `/official/analytics` (Recharts), `/official/surveys`.
- **Transparency:** `/transparency`, `/transparency/issues`, `/transparency/departments`, `/transparency/response-times`, `/transparency/trends`, `/transparency/data`.
- **Shared:** `/profile` (role-based dashboard link).

**Implementation:** Next.js App Router (layouts, server/client components); role-based redirects in dashboard/official/transparency layouts; **Zustand** for auth; **lib/api.js** centralizes fetch with token; **Shadcn** + Tailwind; **Leaflet** for map; **Recharts** for charts; **Sonner** for toasts.

---

## One-line summary for judges

**CivicBridge** is a full-stack civic-tech platform: citizens report issues with location and photos (MongoDB + Mongoose, JWT auth, Cloudinary, Leaflet); officials update status with an auditable timeline; the public sees trending issues, comments, votes, and surveys; and transparency/analytics dashboards use the same APIs with role-based access—all built with **Next.js 16**, **React 19**, **MongoDB/Mongoose**, **Zod**, and **Tailwind/Shadcn**.

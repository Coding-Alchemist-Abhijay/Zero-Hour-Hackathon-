# CivicBridge — Route Reference

This document explains **every frontend page route** and **every API route** in the app.

---

## Frontend routes (pages)

All pages under `app/` are rendered by Next.js App Router. Layouts: `(main)` = Navbar + Footer; `(auth)` = minimal layout for login/register; dashboard/official/transparency have sidebars.

---

### Public (no login required)

| Route | File | What it does |
|-------|------|----------------|
| **/** | `(main)/page.js` | **Home.** Hero, “Why CivicBridge”, live trending issues block, testimonials, CTA. |
| **/about** | `(main)/about/page.js` | **About.** Vision, smart city, transparency, government–citizen collaboration. |
| **/how-it-works** | `(main)/how-it-works/page.js` | **How it works.** Step-based: Report → Track → Government responds → Public transparency (with icons). |
| **/features** | `(main)/features/page.js` | **Features.** Issue reporting, map, timeline, voting, analytics, surveys, AI. |
| **/contact** | `(main)/contact/page.js` | **Contact.** Form (name, email, message); submits with toast (no backend yet). |
| **/community** | `(main)/community/page.jsx` | **Community portal.** Lists public issues (from API). Links to Trending and Discussions. |
| **/community/trending** | `(main)/community/trending/page.jsx` | **Trending issues.** Top issues by votes + recency (uses `/api/issues/trending`). |
| **/community/discussions** | `(main)/community/discussions/page.jsx` | **Discussions.** Issues sorted by comment count (most discussion first). |
| **/community/issues/[id]** | `(main)/community/issues/[id]/page.jsx` | **Public issue detail.** Read-only view: title, status, timeline, comments; Vote button if logged in; link to dashboard issue. |
| **/surveys** | `(main)/surveys/page.jsx` | **Surveys list.** All published surveys; “Respond” links to `/surveys/[id]`. |
| **/surveys/[id]** | `(main)/surveys/[id]/page.jsx` | **Respond to survey.** Form with one input per question; submits to `POST /api/surveys/[id]/respond` (login required). |
| **/surveys/[id]/results** | `(main)/surveys/[id]/results/page.jsx` | **Survey results.** Aggregated answers per question (options + counts) from `GET /api/surveys/[id]/results`. |

---

### Auth (login/register)

| Route | File | What it does |
|-------|------|----------------|
| **/login** | `(auth)/login/page.jsx` | **Login.** Email + password; “Remember me”; submits to `POST /api/auth/login`; redirects to role-based dashboard. |
| **/register** | `(auth)/register/page.jsx` | **Register.** Name, email, password, **role** (Resident / Official / Journalist / Admin); submits to `POST /api/auth/register`; then redirects. |

---

### Resident dashboard (role: RESIDENT)

Requires login; layout has resident sidebar. Unauthenticated → `/login`; OFFICIAL/ADMIN → `/official`; JOURNALIST → `/transparency`.

| Route | File | What it does |
|-------|------|----------------|
| **/dashboard** | `(main)/dashboard/page.jsx` | **Resident overview.** Cards: total / pending / resolved issues; recent activity list. |
| **/dashboard/issues** | `(main)/dashboard/issues/page.jsx` | **My issues list.** Table/cards with status, category, search and filters (status, category). |
| **/dashboard/issues/new** | `(main)/dashboard/issues/new/page.jsx` | **Report issue.** Form: title, description, category, severity, images, map/GPS; submits `POST /api/issues`. |
| **/dashboard/issues/[id]** | `(main)/dashboard/issues/[id]/page.jsx` | **Issue detail (resident).** Full detail, timeline, comments, vote; add comment. |
| **/dashboard/map** | `(main)/dashboard/map/page.jsx` | **Map reporting.** Lat/lng/radius inputs; fetches nearby issues (`/api/issues/nearby`); map placeholder for real map. |
| **/dashboard/tracking** | `(main)/dashboard/tracking/page.jsx` | **Tracking.** Track all your issues; timeline, notifications, estimated resolution. |
| **/dashboard/community** | `(main)/dashboard/community/page.jsx` | **Community (in dashboard).** Trending issues in dashboard context. |
| **/dashboard/notifications** | `(main)/dashboard/notifications/page.jsx` | **Notifications.** List from `GET /api/notifications`; mark read. |
| **/dashboard/my-impact** | `(main)/dashboard/my-impact/page.jsx` | **My impact.** Issues solved, community contribution, citizen score. |

---

### Official dashboard (role: OFFICIAL or ADMIN)

Layout has official sidebar. Unauthenticated → `/login`; RESIDENT → `/dashboard`; JOURNALIST → `/transparency`.

| Route | File | What it does |
|-------|------|----------------|
| **/official** | `(main)/official/page.jsx` | **Official overview.** Pending issues count, total issues, last 30 days; link to issue queue. |
| **/official/issues** | `(main)/official/issues/page.jsx` | **Issue queue.** List all issues; filter by status; links to detail. |
| **/official/issues/[id]** | `(main)/official/issues/[id]/page.jsx` | **Issue detail (official).** Update status, add note; `PATCH /api/issues/[id]`; timeline. |
| **/official/heatmap** | `(main)/official/heatmap/page.jsx` | **Heatmap.** Placeholder for problem hotspots; intended for map + `/api/issues/nearby` or analytics. |
| **/official/sla** | `(main)/official/sla/page.jsx` | **SLA tracking.** Placeholder for delay/response-time tracking (SLA data). |
| **/official/analytics** | `(main)/official/analytics/page.jsx` | **Analytics.** Charts (Recharts): by status (bar), by category (pie); uses `GET /api/analytics`. |
| **/official/surveys** | `(main)/official/surveys/page.jsx` | **Surveys (official).** List surveys; links to “Results” (`/surveys/[id]/results`). |

---

### Transparency dashboard (role: JOURNALIST or ADMIN)

Layout has transparency sidebar. Unauthenticated → `/login`; RESIDENT → `/dashboard`; OFFICIAL → `/official`.

| Route | File | What it does |
|-------|------|----------------|
| **/transparency** | `(main)/transparency/page.jsx` | **Transparency overview.** Total/open issues, last 30 days; links to explorer, departments, response times, trends, data. |
| **/transparency/issues** | `(main)/transparency/issues/page.jsx` | **Public issue explorer.** All issues; filter by status; links to `/community/issues/[id]`. |
| **/transparency/departments** | `(main)/transparency/departments/page.jsx` | **Departments leaderboard.** List from `GET /api/departments`. |
| **/transparency/response-times** | `(main)/transparency/response-times/page.jsx` | **Response times.** Summary from analytics; placeholder for SLA/response metrics. |
| **/transparency/trends** | `(main)/transparency/trends/page.jsx` | **Trends.** Bar chart by category from `GET /api/analytics`. |
| **/transparency/data** | `(main)/transparency/data/page.jsx` | **Open data.** Placeholder for export, filters, journalist tools. |

---

### Shared (any logged-in user)

| Route | File | What it does |
|-------|------|----------------|
| **/profile** | `(main)/profile/page.jsx` | **Profile.** Name, email, role; “Go to dashboard” (role-based: resident → `/dashboard`, official/admin → `/official`, journalist → `/transparency`). |

---

## API routes

Base path: `/api`. Auth: many routes use `Authorization: Bearer <accessToken>` and/or role checks.

---

### Auth

| Method | Path | What it does |
|--------|------|----------------|
| **POST** | `/api/auth/register` | Register: body `{ name, email, password, role }`. Creates user; returns user + accessToken. |
| **POST** | `/api/auth/login` | Login: body `{ email, password }`. Returns user + accessToken. |
| **GET** | `/api/auth/me` | Current user (requires Bearer token). Returns user object. |

---

### Issues

| Method | Path | What it does |
|--------|------|----------------|
| **GET** | `/api/issues` | List issues. Query: `status`, `category`, `limit`, etc. Returns array; includes `_count` (votes, comments), createdBy. |
| **POST** | `/api/issues` | Create issue (auth). Body: title, description, category, severity, latitude, longitude, address, images, etc. |
| **GET** | `/api/issues/[id]` | Single issue (public). Includes `userVoted` when authenticated. |
| **PATCH** | `/api/issues/[id]` | Update issue (OFFICIAL/ADMIN). Body: status, assignedToId, departmentId, note. Creates timeline entry. |
| **GET** | `/api/issues/trending` | Trending issues. Query: `limit`. Sorted by vote count + recency. |
| **GET** | `/api/issues/nearby` | Issues near a point. Query: `lat`, `lng`, `radiusKm`. Returns issues in radius. |

---

### Comments

| Method | Path | What it does |
|--------|------|----------------|
| **GET** | `/api/comments` | List comments. Query: `issueId`. Returns comments with user. |
| **POST** | `/api/comments` | Add comment (auth). Body: `{ issueId, content }`. |

---

### Votes

| Method | Path | What it does |
|--------|------|----------------|
| **POST** | `/api/votes` | Toggle vote (auth). Body: `{ issueId }`. If already voted → remove; else add. Returns `{ voted: true/false }`. |

---

### Timeline

| Method | Path | What it does |
|--------|------|----------------|
| **GET** | `/api/timeline` | List timeline entries. Query: `issueId`. Returns status changes + notes for an issue. |

---

### Analytics

| Method | Path | What it does |
|--------|------|----------------|
| **GET** | `/api/analytics` | Aggregates (auth). Returns e.g. totalIssues, last30Days, byStatus, byCategory for charts. |

---

### Notifications

| Method | Path | What it does |
|--------|------|----------------|
| **GET** | `/api/notifications` | List notifications (auth). Query: `limit`, etc. |
| **PATCH** | `/api/notifications/[id]/read` | Mark one notification as read (auth). |

---

### Surveys

| Method | Path | What it does |
|--------|------|----------------|
| **GET** | `/api/surveys` | List surveys (e.g. published). |
| **GET** | `/api/surveys/[id]` | Single survey with questions. |
| **GET** | `/api/surveys/[id]/results` | Aggregated results: byQuestion (text, options with counts, total), totalResponses. |
| **POST** | `/api/surveys/[id]/respond` | Submit response (auth). Body: `{ answers: [ { questionId, value } ] }`. |

---

### Departments

| Method | Path | What it does |
|--------|------|----------------|
| **GET** | `/api/departments` | List departments (id, name, description, etc.). |

---

## Quick map: frontend → API

- **Home trending block** → `GET /api/issues/trending`
- **Community / discussions / trending** → `GET /api/issues`, `GET /api/issues/trending`
- **Community issue detail** → `GET /api/issues/[id]`, timeline, comments, `POST /api/votes`
- **Resident dashboard overview** → `GET /api/issues`, `GET /api/analytics`
- **Resident issues list/new/detail** → `GET/POST /api/issues`, `GET/PATCH /api/issues/[id]`, comments, votes, timeline
- **Resident map** → `GET /api/issues/nearby`
- **Resident notifications** → `GET /api/notifications`, `PATCH /api/notifications/[id]/read`
- **Official queue & detail** → `GET /api/issues`, `PATCH /api/issues/[id]`, `GET /api/timeline`
- **Official analytics** → `GET /api/analytics`
- **Transparency** → `GET /api/issues`, `GET /api/analytics`, `GET /api/departments`
- **Surveys** → `GET /api/surveys`, `GET /api/surveys/[id]`, `POST /api/surveys/[id]/respond`, `GET /api/surveys/[id]/results`
- **Profile** → `GET /api/auth/me`

---

*Generated for CivicBridge. Update this file when adding or changing routes.*

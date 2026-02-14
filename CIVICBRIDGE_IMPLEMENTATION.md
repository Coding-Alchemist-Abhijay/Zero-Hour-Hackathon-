# CivicBridge – Implementation Summary

## ✅ Done in this pass

### Database (Prisma)
- **Schema** (`prisma/schema.prisma`): Users (with Role), Departments, Issues, IssueImages, IssueTimeline, Comments, Votes, Notifications, Surveys, SurveyQuestions, SurveyResponses, AiPrediction (schema only), SLATracking. Enums: Role, IssueStatus, IssueCategory, IssueSeverity, NotificationType.
- **Seed** (`prisma/seed.js`): Demo departments, users (admin, officials, journalist, residents), issues, timeline, comments, votes, notifications, one survey with question and response. Password for all demo users: `Demo123!`
- **Run**: `npx prisma migrate dev --name civicbridge_full` then `npm run db:seed` (or `npx prisma db seed`).

### API routes
| Route | Methods | Auth | Description |
|-------|---------|------|-------------|
| `/api/auth/*` | (existing) | - | Register, login, me |
| `/api/issues` | GET, POST | POST: Resident/Admin | List (filter by status, category, departmentId), Create issue |
| `/api/issues/[id]` | GET, PATCH | PATCH: Official/Admin | Get one, Update status/assign |
| `/api/issues/trending` | GET | - | Trending by votes + recency |
| `/api/issues/nearby` | GET | - | Geo nearby (lat, lng, radiusKm) |
| `/api/comments` | GET, POST | POST: auth | List by issueId, Create comment (optional parentId) |
| `/api/votes` | POST | auth | Toggle upvote on issue |
| `/api/timeline` | GET | - | Timeline for issueId |
| `/api/analytics` | GET | - | Aggregates: total, by status, by category, by department, last 30 days |
| `/api/notifications` | GET | auth | List user notifications |
| `/api/notifications/[id]/read` | PATCH | auth | Mark read |
| `/api/surveys` | GET, POST | POST: Official/Admin | List (published or all), Create survey |
| `/api/surveys/[id]` | GET | - | Get survey (if published) |
| `/api/surveys/[id]/results` | GET | - | Aggregate results |
| `/api/surveys/[id]/respond` | POST | auth | Submit answers |
| `/api/departments` | GET | - | List departments |

### Lib & types
- `lib/api-auth.js`: `getCurrentUser(req)`, `requireAuth(req)`, `requireRole(user, roles)`.
- `lib/validations/issue.js`: createIssueSchema, updateIssueSchema, paginationSchema, nearbyQuerySchema.
- `types/index.js`: ROLES, ISSUE_STATUS, ISSUE_CATEGORIES, ISSUE_SEVERITIES, NOTIFICATION_TYPES.

### Note on auth
- Existing auth (JWT, register/login/me) is unchanged. User model now has `id` as `cuid()` (string). If you had existing data with integer `id`, run a fresh migration or adjust migrations for your data.

---

## 🔲 Suggested next steps (UI & features)

1. **Migrations & seed**  
   - `npx prisma migrate dev --name init_civicbridge`  
   - `npm run db:seed`

2. **Resident dashboard**  
   - `/dashboard/issues` – list issues (use `GET /api/issues`).  
   - `/dashboard/issues/new` – report form (categories, severity, location, images → `POST /api/issues`).  
   - `/dashboard/issues/[id]` – detail + timeline (`GET /api/issues/[id]`, `GET /api/timeline?issueId=`), comments, vote.

3. **Map & geo**  
   - Map component (e.g. Mapbox or Google Maps) on dashboard and transparency.  
   - Clusters: use `GET /api/issues/nearby` or list with bounds.  
   - Heatmap: use analytics + issue list and render density client-side.

4. **Transparency dashboard**  
   - `/transparency` – use `GET /api/analytics` and `GET /api/issues` for charts (e.g. Recharts) and tables.

5. **Official dashboard**  
   - `/official/issues` – queue (filter by status/department).  
   - `/official/issues/[id]` – update status/assign (`PATCH /api/issues/[id]`).

6. **Notifications**  
   - Toast or in-app list from `GET /api/notifications`; mark read with `PATCH /api/notifications/[id]/read`.

7. **Surveys UI**  
   - Public list and respond form; results page using `/api/surveys/[id]/results`.

8. **Role-based routing**  
   - Middleware or layout: redirect Resident → `/dashboard`, Official → `/official`, etc., based on `user.role` from `/api/auth/me`.

AI features (categorization, fraud detection, resolution prediction, geo risk) are **not** implemented; only the `AiPrediction` model exists for future use.

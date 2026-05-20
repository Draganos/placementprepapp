# PlacementPrep.co.uk MVP Blueprint

Yes — your foundational plan is strong enough to get the project up and running.

This repo already contains a practical Next.js + Supabase skeleton aligned to your MVP (auth pages, application tracker pages, analytics pages, AI insight route, CV versions, profile settings).

## MVP scope lock (summer project)
Build only these in v1:
1. Authentication (Supabase Auth)
2. Student profile setup
3. Application tracker
4. Status/stage tracking
5. Analytics dashboard
6. CV version tracking
7. AI weekly insights
8. Deadline reminders

Avoid: university dashboard, job board, CV builder, payments, mobile apps.

---

## Recommended implementation order

### Phase 1 — Foundation
- Configure Supabase project + environment variables.
- Run schema SQL.
- Verify sign up / log in / route protection.
- Ship minimal dashboard shell.

### Phase 2 — Tracker CRUD
- Create application form.
- List table with filtering/sorting.
- Edit + delete.
- Stage dropdown with fixed statuses.
- Notes support.

### Phase 3 — Analytics
- KPI cards: total, active, offers, rejections.
- Conversion rates: OA, interview, offer.
- Sector breakdown chart.
- Weekly volume chart.

### Phase 4 — CV versioning
- CV version create/list.
- Attach CV version to application.
- Compare outcomes by CV version.

### Phase 5 — AI weekly insight
- Aggregate user funnel stats.
- Send structured payload to OpenAI.
- Save summary/strengths/weaknesses/next steps.
- Display latest + history.

### Phase 6 — Reminders
- Upcoming deadlines widget.
- “No update for X days” stale flags.
- Optional daily cron reminder (email/in-app later).

### Phase 7 — Beta validation
- Test with 10–20 students.
- Track weekly active usage and application logging consistency.
- Keep only features students repeatedly use.

---

## Canonical status model
Use fixed enum values first:
- Saved
- Applied
- Online Assessment
- Interview
- Assessment Centre
- Offer
- Rejected
- Withdrawn
- Ghosted

---

## Database schema (MVP)
Use `supabase/schema.sql` as the source of truth and ensure it contains:

- `users_profile`
  - `id`, `user_id`, `university`, `degree`, `graduation_year`, `target_roles`, `target_sectors`, `skills`, `created_at`
- `applications`
  - `id`, `user_id`, `company_name`, `role_title`, `sector`, `location`, `application_date`, `deadline`, `status`, `source`, `cv_version_id`, `notes`, `created_at`, `updated_at`
- `application_events`
  - `id`, `application_id`, `user_id`, `event_type`, `event_date`, `notes`, `created_at`
- `cv_versions`
  - `id`, `user_id`, `version_name`, `file_url`, `notes`, `created_at`
- `ai_insights`
  - `id`, `user_id`, `summary`, `strengths`, `weaknesses`, `next_steps`, `created_at`

Also include:
- RLS on all user data tables.
- Policies scoped to `auth.uid() = user_id`.
- Foreign keys with cascade deletes where appropriate.
- `updated_at` trigger for `applications`.

---

## Practical file structure (current app shape)

```text
src/
  app/
    api/insights/route.ts
    analytics/page.tsx
    ai-insights/page.tsx
    applications/
      page.tsx
      new/page.tsx
      [id]/page.tsx
      [id]/edit/page.tsx
    cv-versions/page.tsx
    dashboard/layout.tsx
    login/page.tsx
    signup/page.tsx
    settings/profile/page.tsx
  components/
    analytics/
    applications/
    cv/
    dashboard/
    layout/
    settings/
  lib/
    supabase/
      client.ts
      server.ts
  types/database.ts
supabase/
  schema.sql
```

---

## Done definition for “up and running”
You are production-ready for MVP beta when:
- New user can sign up/login and complete profile.
- User can log, edit, and update applications with statuses.
- Dashboard shows funnel metrics and charts correctly.
- User can attach CV version and view outcome differences.
- User receives a weekly AI insight from their own data.
- Upcoming deadline + stale application reminders appear.

If those six are reliable, deploy to Vercel and start student testing immediately.

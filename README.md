# GeoMentor Africa

GeoMentor Africa is a mobile-first spatial learning and biodiversity platform for students, schools, mentors and domain experts.

This repository contains the first pilot slice:

- Student biodiversity dashboard and school impact summary
- Mobile field capture with camera, GPS accuracy and offline IndexedDB drafts
- Mentor portfolio, supervised sessions and guidance requests
- Expert validation queue where AI suggestions never become verified automatically
- PostgreSQL/PostGIS schema with school-scoped row-level security policies
- Responsive layouts and rendered-route tests

## Supabase connection

The pilot uses Supabase Auth, Postgres/PostGIS, Row Level Security, and a private `observation-evidence` storage bucket. Copy `.env.example` to `.env.local` and set the project URL plus publishable key. Never expose `SUPABASE_SECRET_KEY` in browser code.

Apply `supabase/migrations/0001_core.sql` through `0004_onboarding_administration.sql` in order through the Supabase migration pipeline. Schools, mentors and experts verify their email before submitting a review application. Students verify a school-managed email, enter a teacher-issued class code, and remain pending until teacher review and consent recording. The onboarding administration workspace reviews applications, creates class codes, records consent decisions, and issues email-bound staff invitations.

## Product boundaries

The current hosted surface is a functional product preview connected to a Supabase project. Offline drafts remain on the user’s device; live submissions activate after the database migrations and school onboarding records are applied.

Student safety is a release requirement:

- Invite-only school membership
- Guardian/school consent records where applicable
- No public student profiles
- No direct student-to-mentor messaging
- Teacher-supervised mentoring spaces
- Restricted coordinates for sensitive observations
- Private media until moderation and review
- Auditable verification and administrative actions

## Technology

- React 19, TypeScript and Vinext
- Cloudflare-compatible application output
- PostgreSQL with PostGIS for production spatial records
- Supabase Auth and Storage as the intended production identity/media layer
- IndexedDB for device-local field drafts

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

The application is available at `http://localhost:3000`.

## Quality checks

```bash
npm run lint
npm test
```

`npm test` creates a production build and verifies the student, field capture, mentor and expert routes as rendered HTML.

## Database

The production migration is in `supabase/migrations/0001_core.sql`. It creates the core organizational, school, project, garden, observation, media, AI suggestion, expert review, consent and audit structures.

Apply migrations through a reviewed deployment pipeline. Do not paste production changes directly into the database console. Every exposed table must retain both least-privilege grants and Row-Level Security policies.

Required production environment values will include:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

Secret or service-role credentials must only exist in trusted server-side runtime configuration. They must never be included in browser code or committed to source control.

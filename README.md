# GeoMentor Africa

GeoMentor Africa is a mobile-first spatial learning and biodiversity platform for students, schools, mentors and domain experts.

This repository contains the first pilot slice:

- Student biodiversity dashboard and school impact summary
- Public pilot landing page with role-specific entry points
- Public Trust and Safety Centre covering safeguarding, privacy, consent, pilot terms and support
- Mobile field capture with camera, GPS accuracy and offline IndexedDB drafts
- Mentor portfolio, supervised sessions and guidance requests
- Expert validation queue where AI suggestions never become verified automatically
- Teacher evidence-quality gate before expert scientific validation
- School operations dashboard for consent, review queues and privacy-safe mapping
- Role-aware portal that reveals only verified workspaces after sign-in
- PostgreSQL/PostGIS schema with school-scoped row-level security policies
- Responsive layouts and rendered-route tests

## Supabase connection

The pilot uses Supabase Auth, Postgres/PostGIS, Row Level Security, and a private `observation-evidence` storage bucket. Copy `.env.example` to `.env.local` and set the project URL plus publishable key. Never expose a Supabase secret or service-role key in browser code.

Apply `supabase/migrations/0001_core.sql` through `0006_school_operations_dashboard.sql` in order through the Supabase migration pipeline. Schools, mentors and experts verify their email before submitting a review application. Students verify a school-managed email, enter a teacher-issued class code, and remain pending until teacher review and consent recording. The onboarding administration workspace reviews applications, creates class codes, records consent decisions, and issues email-bound staff invitations. Migrations 0005 and 0006 activate the controlled student → teacher → expert workflow and the protected school operations summary.

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

- Next.js 16, React 19 and TypeScript
- Tailwind CSS 4 with accessible reusable UI components
- Standard Next.js production output for Vercel
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

`npm test` creates a production build and verifies all public, registration, role workspace and administration routes over a production server.

## Vercel deployment

Import the repository into Vercel and use the detected Next.js defaults:

- Framework preset: `Next.js`
- Root directory: repository root (`.`)
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: leave blank (Next.js default)
- Node.js version: `22.x`

Add these values to the Production, Preview and Development environments in Vercel:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_SITE_URL=https://your-production-domain.example
```

The publishable key is designed for browser use and is protected by the database Row-Level Security policies. Do not add a Supabase secret or service-role key to any `NEXT_PUBLIC_` variable.

After Vercel creates the production domain, configure Supabase Authentication:

- Site URL: the exact production URL, for example `https://your-project.vercel.app`
- Redirect URL: `http://localhost:3000/**`
- Redirect URL: `https://your-project.vercel.app/**`
- Add the custom production domain as another redirect URL when it is connected

Preview deployment redirects may be added separately when preview authentication is required. Restrict them to the Vercel project/team pattern rather than allowing unrelated domains.

## Database

The production migration is in `supabase/migrations/0001_core.sql`. It creates the core organizational, school, project, garden, observation, media, AI suggestion, expert review, consent and audit structures.

Apply migrations through a reviewed deployment pipeline. Do not paste production changes directly into the database console. Every exposed table must retain both least-privilege grants and Row-Level Security policies.

Required production environment values are:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=
```

This pilot currently needs no Supabase secret or service-role credential in Vercel. If a future server-only feature requires one, it must never use a `NEXT_PUBLIC_` name or be committed to source control.
# geo-mentor-africa

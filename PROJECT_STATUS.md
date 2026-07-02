# Project Status Report

Audit date: 2026-07-01

## Executive Summary

Constituency Connect is a Next.js 16 App Router project for a WhatsApp-first public grievance platform. The repository contains meaningful foundations for Firebase, Firestore data modeling, WhatsApp webhook handling, a conversation state machine, seed data, and dashboard UI.

The project is not production-ready. The active dashboard and login flow are mock/localStorage based, while the Firebase-backed hooks and services are mostly disconnected from the rendered pages. The production build currently fails because `app/dashboard/complaints/[id]/page.tsx` imports named exports from the wrong module. ESLint also fails with React compiler rules and explicit `any` usage.

## Architecture Observed

- Framework: Next.js 16.2.9 App Router with React 19.2.4 and Turbopack.
- UI: Tailwind CSS 4, Base UI button, lucide-react icons, several reusable dashboard/auth/shared components.
- Firebase client layer: `firebase/` exports app, auth, firestore, and storage singletons plus typed helper functions.
- Domain service layer: `services/` contains auth, user, complaint, dashboard, and storage service wrappers.
- Data model: `types/db/` defines master, admin, citizen, complaint, media, notification, and sample data types.
- WhatsApp backend: `app/api/whatsapp/webhook/route.ts` receives Meta webhook events, normalizes inbound messages, runs `lib/conversation`, and sends replies through WhatsApp Cloud API.
- Conversation engine: `lib/conversation/` manages citizen state in Firestore, step handlers, ticket generation, complaint creation, and confirmation replies.
- Dashboard UI: `app/dashboard/*` renders overview, complaint list/detail, analytics, and settings, but currently from `lib/mockData`.
- Auth architecture split: `contexts/AuthContext.tsx` implements Firebase Auth and Firestore role resolution, but the active `app/login/page.tsx` uses a mock cookie login.
- Seed tooling: `scripts/seed/` seeds organization, categories, constituencies, departments, areas, wards, and streets.

## Completed Modules

- Next.js app shell: `app/layout.tsx`, global providers, root redirect to `/dashboard`.
- Firebase wrapper modules: `firebase/firebase.ts`, `firebase/firestore.ts`, `firebase/auth.ts`, `firebase/storage.ts`, `firebase/index.ts`.
- Firestore collection constants and domain types: `constants/firestore.ts`, `types/db/*`.
- WhatsApp webhook verification and POST handler: `app/api/whatsapp/webhook/route.ts`.
- Conversation state machine: `lib/conversation/engine.ts`, `state-store.ts`, `ticket.ts`, `normalize.ts`, and step handlers.
- Firestore dashboard service primitives: real-time stats/list/detail listeners and update fetching in `services/dashboard.service.ts`.
- Complaint service primitives: create, get, list, assign, update status in `services/complaint.service.ts`.
- Firebase Auth context and hooks: `contexts/AuthContext.tsx`, `hooks/useAuth.ts`, `hooks/useRequireAuth.ts`.
- Seed dry-run works outside the sandbox: 121 total seed documents.
- Dashboard mock UI routes exist for overview, complaints, complaint detail, analytics, and settings.

## Partially Completed Modules

- Dashboard: visually implemented, but uses `lib/mockData` instead of Firebase services/hooks.
- Login/auth: Firebase Auth context exists, but `/login` bypasses it with mock email/password and Google flows that only set `cc_session`.
- Route protection: `middleware.ts` checks only an optimistic `cc_session` cookie. It does not verify Firebase ID tokens. Next.js 16 also warns that `middleware` is deprecated in favor of `proxy`.
- Firebase environment validation: `validateEnv()` is defined but never called before initializing Firebase.
- WhatsApp complaint media: image `mediaId` is collected, but media is not downloaded from Meta or stored in Firebase Storage; complaints are created with `mediaIds: []`.
- Notifications: types exist and WhatsApp outbound replies are sent from the webhook, but there is no durable notification service/history or dashboard notification integration.
- Analytics: page exists, but charts and KPIs are mock/static calculations.
- Settings: page exists, but save only updates local React state and does not persist.
- Role/permission UI: components/hooks exist, but active dashboard pages do not use `useRequireAuth` or `RoleGuard`.

## Missing Modules

- Real Firebase-backed dashboard pages wired to `useDashboardStats`, `useComplaintList`, and `useComplaintDetail`.
- Production login page using `EmailLoginForm`, `GoogleLoginButton`, and `AuthContext`.
- Volunteer management route, despite `ROUTES.DASHBOARD_VOLUNTEERS`.
- Reports/export module.
- Admin onboarding/profile management UI.
- Firebase security rules and Firestore indexes files.
- WhatsApp media download/storage pipeline.
- WhatsApp status update notifications for assignment/resolution events.
- Cloud Functions or backend jobs for SLA breach updates, counters, volunteer stats, and notification triggers.
- Automated tests for conversation flow, webhook signature handling, services, and dashboard hooks.
- Production environment documentation and `.env.example`.

## Duplicate Or Unused Files / Code

- `components/dashboard/StatusBadge.tsx`, `StatsCard.tsx`, and `FilterBar.tsx` duplicate inline logic in `app/dashboard/page.tsx` and `app/dashboard/complaints/page.tsx`.
- `components/auth/EmailLoginForm.tsx`, `GoogleLoginButton.tsx`, and `LogoutButton.tsx` are unused by active `/login` and dashboard layout.
- `hooks/useDashboardStats.ts`, `useComplaintList.ts`, `useComplaintDetail.ts`, and `useRequireAuth.ts` are not used by active dashboard pages.
- `hooks/useComplaints.ts` overlaps with `hooks/useComplaintList.ts`; one-shot listing and real-time paginated listing both exist.
- `services/complaint.service.ts` and `services/dashboard.service.ts` overlap on complaint list/detail concerns.
- `types/db/samples.ts` and `lib/mockData.ts` both provide development/mock data.
- `components/providers/AuthProvider.tsx` is deleted in the worktree, while `components/providers/index.tsx` now imports `AuthProvider` from `contexts/AuthContext.tsx`.
- `README.md` is still the default create-next-app README and repeats `# constituency-connect`.
- `PROJECT.md` states Next.js 15 and NestJS backend, but the actual repo uses Next.js 16 API routes and has no NestJS backend.

## Build And Verification Results

### TypeScript

Command: `npx tsc --noEmit`

Status: failed.

Errors:

- `app/dashboard/complaints/[id]/page.tsx:29` imports `getCategoryIcon` and `getStatusConfig` from `../page`.
- For that route, `../page` resolves to `app/dashboard/complaints/page.tsx`, which does not export those functions.
- The functions are exported from `app/dashboard/page.tsx`, not the complaint list page.

### ESLint

Command: `npm run lint`

Status: failed with 38 errors and 31 warnings.

Primary error groups:

- React compiler rule `react-hooks/set-state-in-effect` across active pages and hooks.
- `react-hooks/purity` for `Date.now()` during render in `app/dashboard/complaints/page.tsx`.
- `@typescript-eslint/no-explicit-any` in `app/dashboard/page.tsx` and `lib/mockData.ts`.
- Unused imports across dashboard pages, conversation engine, and dashboard service.

### Build

Command: `npm run build`

Status: failed.

Confirmed failure after rerun outside sandbox:

- `app/dashboard/complaints/[id]/page.tsx:29` invalid named imports from `../page`.

Additional warning:

- Next.js 16.2.9 warns that the `middleware` file convention is deprecated and should be replaced with `proxy`.

Initial sandbox-only issue:

- `next/font/google` could not fetch Geist fonts under restricted network. Rerunning outside sandbox removed the font fetch failure.

### Seed Dry Run

Command: `npm run seed:dry`

Status: passed when rerun outside sandbox.

Dry-run counts:

- organizations: 1
- categories: 8
- constituencies: 2
- departments: 6
- areas: 8
- wards: 24
- streets: 72
- total: 121

Initial sandbox-only issue:

- `tsx` failed to create its IPC pipe under the sandbox with `listen EPERM`.

## Firebase Integration Verification

Firebase integration is present but incomplete.

Present:

- Client SDK initialization, Firestore helpers, Auth helpers, Storage helpers.
- Firebase Auth context with admin/volunteer role lookup from Firestore.
- Firestore-backed complaint services and dashboard listeners.
- Firebase connection test page at `/test-firebase`.
- Seed scripts using Firebase Admin SDK.

Issues:

- `validateEnv()` is never called, so missing env vars are not actually enforced before `initializeApp`.
- Active dashboard pages do not use Firebase services.
- Active login page does not use Firebase Auth.
- `/test-firebase` is publicly routed unless protected elsewhere and includes a production removal warning.
- No security rules or indexes are included in the repository.
- Storage helpers exist, but WhatsApp photo media is not stored.

## WhatsApp Integration Verification

WhatsApp integration is structurally implemented but not complete end-to-end.

Present:

- GET webhook verification using `WHATSAPP_VERIFY_TOKEN`.
- POST HMAC validation using `WHATSAPP_WEBHOOK_SECRET`.
- Meta payload normalization for text, image, location, and interactive replies.
- Conversation flow through constituency, area, ward, street, category, photo, description, location, and confirmation.
- Complaint creation in Firestore and WhatsApp confirmation reply.
- WhatsApp Cloud API sender for text, buttons, lists, and templates.

Issues:

- If `WHATSAPP_WEBHOOK_SECRET` is unset, POST signature validation is skipped.
- Required WhatsApp env vars are asserted with `!` but not validated with explicit startup errors.
- Media download from Meta is missing.
- Reverse geocoding is not implemented.
- Outbound assignment/status notifications are not triggered by dashboard actions.
- The active dashboard does not show real WhatsApp-created complaints.

## Dashboard Implementation Verification

Dashboard UI is implemented as a mock demo, not a production dashboard.

Implemented routes:

- `/dashboard`
- `/dashboard/complaints`
- `/dashboard/complaints/[id]`
- `/dashboard/analytics`
- `/dashboard/settings`

Current behavior:

- Reads and mutates `lib/mockData` using localStorage.
- Allows mock assignment and status changes in complaint detail.
- Has responsive navigation and mobile bottom nav.
- Uses hard-coded user and constituency copy.

Not production-ready:

- No Firebase data binding.
- No authenticated session/role checks inside dashboard pages.
- No persisted settings.
- Analytics are mock/static.
- Complaint photos and maps are visual placeholders.
- Build currently fails for complaint detail import.

## Recommended Next Steps

1. Fix the build-breaking import in `app/dashboard/complaints/[id]/page.tsx` by moving shared dashboard helpers into a non-route module or importing from the correct module.
2. Decide whether the dashboard should remain mock-only temporarily or be wired now to Firebase hooks; remove the parallel path that is not chosen.
3. Replace `/login` mock auth with the existing Firebase Auth components/context.
4. Address lint rules project-wide or tune the ESLint config deliberately for React compiler rules.
5. Wire WhatsApp media handling: fetch Meta media, upload to Firebase Storage, write `media` docs, attach IDs to complaints.
6. Add Firestore security rules, index definitions, and `.env.example`.
7. Migrate `middleware.ts` to the Next.js 16 `proxy` convention.

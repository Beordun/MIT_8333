# MivaFix — Step-by-Step Build Plan

This document outlines every step to design, build, test, deploy, and package **MivaFix** (MIT 8333 University Maintenance & Service Request Management System). Each step requires co-builder review and approval before execution.

---

## Step 1: Project Initialization & Secrets Guardrails
- [ ] Initialize Next.js (TypeScript, App Router, Tailwind CSS, `src/` directory).
- [ ] Install dependencies: `prisma`, `@prisma/client`, `jose`, `bcryptjs`, `@types/bcryptjs`, `zod`, `lucide-react`, `vitest`.
- [ ] Create `.env.example` with placeholder keys (`DATABASE_URL`, `JWT_SECRET`).
- [ ] Verify `.gitignore` excludes `.env*`, `node_modules/`, `.next/`, `*.pem`, `*.key`, and local DB files.
- [ ] Import `design-tokens.css` into `src/app/globals.css` and configure `Poppins` via `next/font/google` in `src/app/layout.tsx`.

---

## Step 2: Database Schema & Idempotent Seed (`Prisma + PostgreSQL`)
- [ ] Configure `prisma/schema.prisma` with PostgreSQL datasource and all **6 mandatory entities**:
  1. `Role` (`STUDENT_STAFF`, `MAINTENANCE_OFFICER`, `ADMIN`)
  2. `User` (identity, department, `passwordHash`, `roleId`)
  3. `RequestCategory` (Electrical, Plumbing, ICT/Internet, Furniture, Classroom Equipment, Hostel)
  4. `ServiceRequest` (`ticketNumber`, `title`, `description`, `location`, `priority`, `status`, `evidenceUrl`, `requesterId`, `categoryId`)
  5. `Assignment` (`requestId`, `officerId`, `assignedById`, `notes`, `assignedAt`)
  6. `StatusUpdate` (`requestId`, `updatedById`, `oldStatus`, `newStatus`, `comment`, `createdAt`)
- [ ] Provision cloud PostgreSQL on **Neon.tech** (or Supabase) and store `DATABASE_URL` in `.env` (git-ignored).
- [ ] Run `npx prisma generate` and `npx prisma db push`.
- [ ] Write and run `prisma/seed.ts` to populate roles, categories, demo accounts (Student, Officer, Admin), and sample maintenance requests.

---

## Step 3: Core Libraries, Auth & RBAC Middleware
- [ ] `src/lib/prisma.ts` — Singleton Prisma client for serverless Next.js.
- [ ] `src/lib/auth.ts` — `bcryptjs` password hashing/verification, `jose` JWT sign/verify, HTTP-only cookie helpers, and `getSessionUser()`.
- [ ] `src/lib/api-response.ts` — Standardized JSON response helpers (`200`, `201`, `400`, `401`, `403`, `404`, `409`, `500`).
- [ ] `src/middleware.ts` — Edge route protection redirecting unauthenticated users to `/login` and enforcing role-based dashboard access.

---

## Step 4: Backend REST API Endpoints
- [ ] **Auth APIs:**
  - `POST /api/auth/register` (Zod-validated, defaults to `STUDENT_STAFF`)
  - `POST /api/auth/login` (sets HTTP-only JWT cookie)
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- [ ] **Service Request APIs:**
  - `GET /api/requests` (role-scoped listing with search, category/status/priority filters, and pagination)
  - `POST /api/requests` (creates `ServiceRequest` + initial `StatusUpdate` in `prisma.$transaction`)
  - `GET /api/requests/[id]` (returns ticket details, assignment info, and full `StatusUpdate` audit timeline)
  - `PATCH /api/requests/[id]/status` (Officer/Admin status transition + `StatusUpdate` log)
  - `POST /api/requests/[id]/assign` (Admin assigns Officer → creates `Assignment`, updates status to `ASSIGNED`, logs `StatusUpdate` atomically)
- [ ] **Admin & Utility APIs:**
  - `GET /api/categories`
  - `GET /api/users` & `PATCH /api/users/[id]/role` (Admin user & role management)
  - `GET /api/reports/export` (Admin CSV export)
- [ ] **API Documentation:**
  - `GET /api/openapi` + `/api-docs` interactive Swagger UI page.

---

## Step 5: Frontend UI & Role-Based Dashboards (`design-tokens.css`)
- [ ] Shared UI components (`Navbar`, `StatusBadge`, `PriorityBadge`, `TicketTimelineModal`, `Toast` feedback).
- [ ] **Auth Pages:** `/login` (with 1-click Demo Role Login helpers) and `/register` (with form validation).
- [ ] **Student/Staff Dashboard (`/dashboard/requester`):** KPI summary, New Request modal with fault image upload & preview, My Requests table with search/filter/pagination, and Timeline drawer.
- [ ] **Maintenance Officer Dashboard (`/dashboard/officer`):** Assigned workload queue, fault image viewer, and Update Progress modal (`IN_PROGRESS` / `RESOLVED` + work notes).
- [ ] **Administrator Dashboard (`/dashboard/admin`):** Campus-wide KPIs, unassigned alert banner, 1-click Assign Officer modal, User/Role management tab, and Export CSV / Print Report button.

---

## Step 6: Testing & Quality Assurance (Section E.1 & E.2)
- [ ] Backend API & Auth unit/integration tests (`vitest`) covering registration, login, RBAC enforcement (`403`), and atomic assignment transactions.
- [ ] Frontend component tests covering form validation, role badge rendering, and dashboard states.
- [ ] End-to-end visual verification of all 3 role flows via browser, capturing high-resolution screenshots for the report.

---

## Step 7: Cloud Deployment & Single-PDF Packaging (Section E.3 & F)
- [ ] Pre-push security audit (`git status`, `git diff --cached`, `.gitignore` verification).
- [ ] Push clean codebase to GitHub and deploy to **Vercel** with `DATABASE_URL` and `JWT_SECRET` environment variables.
- [ ] Verify live production URL connects to Neon PostgreSQL cleanly.
- [ ] Compile **12-Section Technical Report + Interface Screenshots + Testing Evidence + Clean Source Code** into **one submission PDF**.


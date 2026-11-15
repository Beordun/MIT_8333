# Product Requirements Document (PRD)
**Product Name:** MivaFix — University Maintenance & Service Request Platform  
**Version:** 1.0 (MVP)  
**Target:** MIT 8333 Full-Stack Web Application & Cloud Deployment  

---

## 1. Executive Summary & Product Vision
Universities lose time, money, and student trust when facility complaints live in WhatsApp chats, paper slips, and phone calls. **MivaFix** replaces that chaos with one fast, accountable digital ticketing loop:

> **Submit in 30 seconds → Assign in 1 click → Track every status change.**

Guiding principle for v1: **precision over bloat**. Every screen, endpoint, and database table exists to solve the core maintenance loop and satisfy every requirement of the MIT 8333 specification.

---

## 2. Strategic Scope: Non-Goals for v1
| Cut Feature | Reason | v1 Alternative |
| :--- | :--- | :--- |
| **Live Chat / Comment Threads** | Turns a maintenance queue into another noisy WhatsApp. | Structured **Status Updates + Technical Remarks** (`StatusUpdate` audit log). |
| **WebSockets / Push Servers** | Overkill for serverless deployment; adds infra complexity. | Clean REST revalidation + **Nodemailer Gmail SMTP confirmation & status emails**. |
| **Spare-Parts Inventory & Budgeting** | Enterprise ERP scope creep; not requested in the brief. | Simple **Resolution Notes** field when closing a job. |
| **OAuth / Social Login** | Adds external provider config friction for graders. | **Email + Password (JWT + bcrypt)** with 1-click **Demo Role Login** buttons. |
| **Multi-Page Profile Builders** | Distracts from the core workflow. | Minimal registration fields (`Full Name`, `Email`, `Department`, `Password`). |

---

## 3. Target Personas & Jobs-to-be-Done (JTBD)
1. **Requester (`STUDENT_STAFF`):** *"Let me report a fault with a photo in under 30 seconds and see when someone is actually coming to fix it."*
2. **Resolver (`MAINTENANCE_OFFICER`):** *"Show me only the jobs assigned to me, sorted by urgency, and let me update progress in two taps."*
3. **Controller (`ADMIN`):** *"Give me a live view of unassigned complaints, let me dispatch officers in one click, and let me export reports for university management."*

---

## 4. Core Product Workflow (Ticket Lifecycle)
`PENDING` (Submitted by Student/Staff) → `ASSIGNED` (Dispatched by Admin to Officer) → `IN_PROGRESS` (Officer working) → `RESOLVED` (Officer completed) → `CLOSED` (Admin verified)

Every transition automatically writes an immutable entry to `StatusUpdate`.

---

## 5. Functional Requirements (MVP)
- **Auth, OTP & Security (`/register`, `/verify-email`, `/login`, `/forgot-password`, `/reset-password`):**
  - Strong passwords required (minimum 8 characters, at least 1 capital letter, 1 number, and 1 special character).
  - Password fields include an accessible show/hide toggle icon.
  - Single-use 6-digit OTPs (10-minute expiry, hashed in `VerificationOtp`) sent via **Nodemailer (Gmail SMTP)** for email verification and password reset, plus password-changed, account-locked, and ticket status update emails.
  - 5 failed sign-in attempts lock the account for 15 minutes (or until unlocked via password reset).
  - Automatic inactivity sign-out (5 minutes for Students/Staff and Admins; 10 minutes for Maintenance Officers) with server-side `tokenVersion` revocation and redirect to the landing page (`/`).
- **Student/Staff Dashboard (`/dashboard/requester`):** KPI strip, New Request form (Category, Location, Priority, Description, Fault Image Upload), My Requests table with search/filter/pagination and Timeline drawer.
- **Maintenance Officer Dashboard (`/dashboard/officer`):** KPI strip, Assigned Work Queue, Status Update modal (`IN_PROGRESS` / `RESOLVED` + work notes).
- **Admin Dashboard (`/dashboard/admin`):** Campus-wide KPIs, Unassigned Queue alert, 1-Click Assign Officer modal, Search/Filter/Pagination, User & Role Management, CSV/Print Report Export.
- **Advanced Features (6 Selected):** JWT Auth, RBAC, Fault Image Upload, Search/Filter/Pagination, Audit Trail (`StatusUpdate`), CSV Export + Interactive `/api-docs`.

---

## 6. Data Architecture (6 Mandatory Entities)
1. `Role` (`STUDENT_STAFF`, `MAINTENANCE_OFFICER`, `ADMIN`)
2. `User` (`fullName`, `email`, `passwordHash`, `department`, `roleId`)
3. `RequestCategory` (`name`, `slaHours`)
4. `ServiceRequest` (`ticketNumber`, `title`, `description`, `location`, `priority`, `status`, `evidenceUrl`, `requesterId`, `categoryId`)
5. `Assignment` (`requestId`, `officerId`, `assignedById`, `notes`, `assignedAt`)
6. `StatusUpdate` (`requestId`, `updatedById`, `oldStatus`, `newStatus`, `comment`, `createdAt`)

---

## 7. UX & Visual Design Strategy
- **Mobile-First Student Experience:** Built for 375px+ mobile screens first—card-based request lists on mobile, `44px+` touch targets, sticky "New Request" CTA, and direct mobile camera capture for fault photos. Progressively enhanced to multi-column tables for desktop Admin views.
- **Design System:** Strictly powered by `design/design-tokens.css` (`Poppins` font, `--primary-color`, `--secondary-color`, `--surface-container-lowest-color`, `--radius-lg`, `--elevation-1`).

---

## 8. Definition of Done (DoD)
- [ ] All 6 Prisma entities deployed to live cloud PostgreSQL (Neon) and seeded.
- [ ] All 3 role dashboards functional with strict RBAC.
- [ ] Automated tests passing for frontend components & backend API endpoints.
- [ ] Live production URL deployed on Vercel and verified against cloud PostgreSQL.
- [ ] Screenshots, test evidence, 12-section report, and codebase packaged into one submission PDF.


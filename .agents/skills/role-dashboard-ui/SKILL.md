---
name: role-dashboard-ui
description: Pattern for building responsive role-based dashboards (Student/Staff, Maintenance Officer, Admin) using design-tokens.css variables.
---

# Role Dashboard UI Pattern

Use this skill when building or updating pages under `src/app/dashboard/**`, `/login`, or `/register`.

## Checklist
1. **Mobile-First & Token Compliance:** Build for 375px+ mobile screens first (card lists on mobile, tables on `md:+`, minimum `44px` tap targets, sticky mobile primary CTA for students, `capture="environment"` on fault photo upload). Reference variables from `design/design-tokens.css` exclusively (`var(--surface-container-lowest-color)`, `var(--primary-color)`, `var(--radius-lg)`, `var(--elevation-1)`, `var(--spacing-4)`).
2. **Role-Specific Views:**
   - **Student/Staff:** KPI summary, "New Service Request" form (with fault category, priority, location, image evidence upload), and personal request tracking table + timeline modal.
   - **Maintenance Officer:** Assigned jobs queue, priority badges, and status update modal (`IN_PROGRESS` / `RESOLVED` + work notes).
   - **Admin:** Campus-wide KPIs, unassigned alert banner, Officer assignment dropdown, search/filter/pagination bar, user management table, and CSV/Print report export.
3. **Feedback States:** Include loading skeletons/spinners, empty states, inline form validation errors, and toast notifications for all mutations.


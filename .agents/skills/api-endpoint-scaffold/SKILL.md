---
name: api-endpoint-scaffold
description: Standard pattern for creating secure Next.js App Router REST API endpoints with JWT auth, RBAC, Zod validation, and Prisma transactions.
---

# API Endpoint Scaffold

Follow this structure for every route handler in `src/app/api/**/route.ts`:

## Standard Flow
1. **Authenticate:** Extract and verify the JWT session via `getSessionUser(req)`. Return `401` if missing or invalid.
2. **Authorize (RBAC):** Check `user.role` against allowed roles (`ADMIN`, `MAINTENANCE_OFFICER`, `STUDENT_STAFF`). Return `403` if unauthorized.
3. **Validate Input:** Parse JSON body or searchParams with a `Zod` schema (`safeParse`). Return `400` with validation details on failure.
4. **Execute Business Logic:**
   - Use `prisma.$transaction` when mutating `ServiceRequest` alongside `Assignment` or `StatusUpdate`.
   - Use `select` to omit sensitive fields (`passwordHash`).
5. **Return JSON:** Use consistent helpers (`ok()`, `created()`, `badRequest()`, `unauthorized()`, `forbidden()`, `notFound()`, `serverError()`).
6. **Document:** Add or update the corresponding entry in `/api-docs` OpenAPI specification.


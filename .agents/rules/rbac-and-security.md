# RBAC & API Security Rule

All backend API routes (`src/app/api/**`) and Next.js middleware (`src/middleware.ts`) MUST enforce strict authentication, authorization, and validation.

## Guidelines
1. **Password Security:** Always hash passwords with `bcryptjs` (minimum 10 salt rounds). Never return `passwordHash` in any API response.
2. **Session / JWT:** Sign and verify JWTs using `jose` stored in HTTP-only, `SameSite=Lax`, `Secure` (in production) cookies. Never expose `JWT_SECRET` in client code.
3. **Role-Based Access Control (RBAC):** Every protected endpoint must verify the caller's role (`STUDENT_STAFF`, `MAINTENANCE_OFFICER`, `ADMIN`) on the server—never rely solely on hiding UI buttons.
   - `STUDENT_STAFF`: Can create requests and view/track only their own requests.
   - `MAINTENANCE_OFFICER`: Can view assigned requests and update status/notes on their assigned jobs.
   - `ADMIN`: Full access to user management, ticket assignment, status monitoring, and CSV/PDF report exports.
4. **Input Validation & Errors:** Validate all request bodies and query params with `Zod`. Return consistent JSON error payloads (`{ error: string, details?: unknown }`) with accurate HTTP status codes (`400`, `401`, `403`, `404`, `409`, `500`).


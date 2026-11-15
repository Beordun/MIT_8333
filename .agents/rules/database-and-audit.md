# Database Schema & Audit Trail Rule

The persistence layer uses PostgreSQL with Prisma ORM and must satisfy Section C and Section D of the MIT 8333 project brief.

## Guidelines
1. **Six Mandatory Entities:** Never collapse or remove the 6 core Prisma models:
   - `Role`
   - `User`
   - `RequestCategory`
   - `ServiceRequest`
   - `Assignment`
   - `StatusUpdate`
2. **Atomic Audit Logging:** Every creation, assignment, or status transition of a `ServiceRequest` MUST create a corresponding `StatusUpdate` record inside `prisma.$transaction([...])` so the audit trail (`oldStatus`, `newStatus`, `updatedById`, `comment`, `createdAt`) is always consistent.
3. **Seed Data:** Keep `prisma/seed.ts` idempotent (`upsert`) and include realistic demo accounts for all 3 roles (`ADMIN`, `MAINTENANCE_OFFICER`, `STUDENT_STAFF`) plus standard campus categories.


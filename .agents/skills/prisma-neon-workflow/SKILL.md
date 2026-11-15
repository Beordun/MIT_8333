---
name: prisma-neon-workflow
description: Workflow for updating Prisma schema, generating the client, pushing migrations to Neon/PostgreSQL, and running idempotent seed data.
---

# Prisma & PostgreSQL (Neon) Workflow

Use this skill whenever modifying `prisma/schema.prisma` or resetting/seeding the database.

## Steps
1. **Validate Schema:**
   ```bash
   npx prisma validate
   ```
2. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```
3. **Push Schema to Database:**
   Ensure `DATABASE_URL` is configured in `.env` (never commit `.env`), then run:
   ```bash
   npx prisma db push
   ```
4. **Seed Demo Data (Idempotent):**
   ```bash
   npx prisma db seed
   ```
5. **Verify Entities:**
   Confirm all 6 required entities (`Role`, `User`, `RequestCategory`, `ServiceRequest`, `Assignment`, `StatusUpdate`) exist and relationships resolve cleanly.


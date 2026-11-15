# Code Conciseness & Submission Readiness Rule

Per the MIT 8333 Submission Guidelines, **all codebase files, screenshots, and the 12-section project report must be submitted in one single PDF**.

## Guidelines
1. **Keep Code Modular & Readable:** Avoid unnecessary boilerplate, dead code, or duplicated logic. Extract shared helpers (e.g., `src/lib/auth.ts`, `src/lib/prisma.ts`, `src/lib/api-response.ts`).
2. **Clean Formatting:** Keep line lengths reasonable (<= 100 chars where practical) and write concise JSDoc/docstrings on exported functions and Prisma models so the code appendix prints cleanly in PDF format.
3. **No Secrets in Repo:** Never hardcode credentials or `.env` values in source files.


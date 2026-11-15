# Git & GitHub Secrets Protection Rule

The agent MUST NEVER stage, commit, or push sensitive files, credentials, or secret values to GitHub or any remote Git repository.

## Forbidden Objects (Never Commit or Push)
1. **Environment Files:** `.env`, `.env.local`, `.env.development`, `.env.production`, `.env.*.local` (only `.env.example` with placeholder values may be committed).
2. **Credentials & Keys:** `DATABASE_URL` connection strings with real passwords, `JWT_SECRET`, `SMTP_USER` / `SMTP_PASS` Gmail App Passwords, API keys, OAuth secrets, `*.pem`, `*.key`, `*.p12`, `*.pfx`, `id_rsa`, or service-account JSON files.
3. **Database Dumps & Local Artifacts:** `*.sql` dumps, `*.sqlite`, `*.db`, or uploaded user/fault files containing real PII.

## Mandatory Pre-Commit & Pre-Push Checks
1. **Verify `.gitignore`:** Before running `git add` or `git commit`, ensure `.gitignore` explicitly excludes `.env*` (except `!.env.example`), `node_modules/`, `.next/`, `*.pem`, `*.key`, and local database files.
2. **Inspect Staged Changes:** Always run `git status` and review `git diff --cached` before committing to confirm no secrets, tokens, or connection strings are staged.
3. **Use Environment Variables Only:** Reference secrets exclusively via `process.env.<VAR_NAME>` in application code; never hardcode fallback secrets in source files (e.g., never write `process.env.JWT_SECRET || "my-secret"`).
4. **If a Secret Is Detected:** Immediately unstage (`git reset HEAD <file>`), remove the secret from tracked files, and alert the user before proceeding.


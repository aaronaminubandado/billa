# Security checklist — Billa Supabase

Manual steps that cannot be done from this repo.

## Rotate database password (P0)

If `DB_PASSWORD` was ever stored locally (e.g. in `.env.local`):

1. Supabase Dashboard → **Project Settings** → **Database**
2. Click **Reset database password**
3. Save the new password in your password manager only — **do not commit**
4. Update any local tools that connect directly to Postgres (not needed for Next.js app using anon key + RLS)
5. Confirm `.env.local` no longer contains `DB_PASSWORD` unless required; add to `.gitignore` (already ignored)

## Verify no service_role in client

- Next.js app should only use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Never add `SUPABASE_SERVICE_ROLE_KEY` to client code or `NEXT_PUBLIC_*` variables

## After RLS migrations

Re-run [`scripts/audit_rls.sql`](scripts/audit_rls.sql) and complete [`audits/2026-06-02_rls_audit.md`](audits/2026-06-02_rls_audit.md).

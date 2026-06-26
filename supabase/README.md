# Supabase — Billa

This folder tracks Supabase schema and Row Level Security for the Billa project. Policy SQL is safe to commit; credentials are not.

## What belongs in git

| Commit | Do not commit |
|---|---|
| `scripts/inventory_remote_db.sql` | `.env.local`, DB passwords |
| `scripts/audit_rls.sql` | Supabase access tokens |
| `migrations/*.sql` | Audit output containing user row data |
| `audits/*.md` (metadata only) | `service_role` key |
| This README | |

## Workflow (inventory first)

```
inventory_remote_db.sql → db_inventory.md → 0000_schema → 0000b_drop_legacy_policies → 0001_rls → 0002_wallet_balance_from_transactions → 0003_schema_reconcile → audit_rls.sql → rls_audit.md
```

Do **not** run migrations until [`audits/2026-06-02_db_inventory.md`](audits/2026-06-02_db_inventory.md) gap matrix is complete.

### 1. Remote database inventory (required first)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**.
2. Run all sections in [`scripts/inventory_remote_db.sql`](scripts/inventory_remote_db.sql).
3. Fill [`audits/2026-06-02_db_inventory.md`](audits/2026-06-02_db_inventory.md) with **metadata only** (table names, columns, policy names — no row data).
4. Complete the **gap matrix** and **go/no-go** checklist in that file.

Queries cover: all public tables, expected-8 existence, columns, RLS status, policies, and policies on non-spec tables.

### 2. Apply schema migration (only if inventory shows gaps)

| Inventory finding | Action |
|---|---|
| Missing table(s) among the 8 | Run [`migrations/0000_schema.sql`](migrations/0000_schema.sql) |
| `transactions.status` missing | Handled by `0000_schema.sql` (`ADD COLUMN IF NOT EXISTS`) |
| Extra public tables not in spec | Document only; do not drop without explicit decision |

`0000_schema.sql` uses `CREATE TABLE IF NOT EXISTS` — safe on partial databases.

### 3. Apply RLS migration (only if inventory shows policy gaps)

| Inventory finding | Action |
|---|---|
| Policies match spec (32 on 8 tables) | **Skip** `0001_rls.sql`; mark RLS audit PASS |
| Missing or wrong policies | Run [`migrations/0001_rls.sql`](migrations/0001_rls.sql) once |
| Legacy policy names differ from `{table}_select_own` etc. | Run [`migrations/0000b_drop_legacy_policies.sql`](migrations/0000b_drop_legacy_policies.sql) **before** `0001_rls` |

Do **not** run `0001_rls.sql` until all target tables exist (or you document an intentional subset).

The migration is **idempotent** (`DROP POLICY IF EXISTS` + `CREATE POLICY`).

### 4. Wallet balance guard (required for your setup)

Run [`migrations/0002_wallet_balance_from_transactions.sql`](migrations/0002_wallet_balance_from_transactions.sql) **after** `0001_rls.sql`.

This replaces the legacy policy `Users cannot update wallet balance manually`:

- Blocks direct `wallets.balance` updates from the client
- Adjusts balance automatically on transaction INSERT / UPDATE / DELETE
- Ignores transactions with `status = 'canceled'`
- Still allows an **opening balance** when creating a new wallet (INSERT)

### 5. RLS verification audit

1. Run [`scripts/audit_rls.sql`](scripts/audit_rls.sql).
2. Record results in [`audits/2026-06-02_rls_audit.md`](audits/2026-06-02_rls_audit.md) (blocked until inventory is complete).

| Check | Expected |
|---|---|
| Tables audited | 8 (or documented subset) |
| RLS enabled | `true` on all target tables |
| Policies per table | 4 (SELECT, INSERT, UPDATE, DELETE) |
| Total policies | 32 (full spec) |
| Owner expression | `auth.uid() = id` on `profiles`; `auth.uid() = user_id` on others |
| Roles | `{authenticated}` |

### 6. Smoke test and commit

1. Smoke test app: login, transactions, wallets, categories, goals, budgets, dashboard.
2. On branch `audit/hardening`, commit updated files under `audits/` and any migration changes.

## Optional: Supabase CLI

For ongoing drift detection (credentials stay local):

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db pull --schema public
```

Project ref is public (same as `NEXT_PUBLIC_SUPABASE_URL`). Access token stays in your local Supabase CLI config, not in this repo.

## Manual checklist (post-apply)

- [ ] `db_inventory.md` complete with GO decision
- [ ] All target tables exist
- [ ] RLS enabled on target tables
- [ ] Expected policy count documented and verified
- [ ] App login and dashboard load for authenticated user
- [ ] `rls_audit.md` updated with PASS and date

## Known limitation

RLS policies enforce row ownership via `user_id` / `id` and validate that referenced `wallet_id` / `category_id` values belong to the same user on `transactions`, `budgets`, and `goals` INSERT/UPDATE policies in [`0001_rls.sql`](migrations/0001_rls.sql).

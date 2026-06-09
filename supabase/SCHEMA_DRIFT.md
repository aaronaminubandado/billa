# Schema drift — live DB vs repo

Last updated: 2026-06-08

This document tracks differences between the live Supabase database and [`migrations/0000_schema.sql`](migrations/0000_schema.sql). Do not drop unknown tables without an explicit decision.

## Extra table: `terms`

| Item | Detail |
|---|---|
| In repo spec? | No |
| Referenced in app? | No |
| Action | **Document only** — do not drop without product decision |

## `budgets.name`

| Item | Expected | Live (2026-06-02 inventory) |
|---|---|---|
| Column | `name TEXT NOT NULL` in repo | **Missing** on some databases |
| App usage | UI reads `budget.name`; inserts may omit it | Works when column absent (PostgREST ignores unknown fields on insert) |
| Fix | [`0003_schema_reconcile.sql`](migrations/0003_schema_reconcile.sql) | Adds column + default `'Budget'` |

## `goals.due_date` vs `deadline`

| Item | Repo migration | Live DB | App code |
|---|---|---|---|
| Column name | `deadline` in `0000_schema.sql` | `deadline` present | Uses `due_date` in inserts/updates |
| Fix | `0003_schema_reconcile.sql` adds `due_date` and backfills from `deadline` | Run migration in Supabase | [`lib/data/goals.ts`](../../lib/data/goals.ts) reads both |

## `categories.type`

| Item | Detail |
|---|---|
| Live DB | Has `type` (required by app filters) |
| Repo `0000_schema` | Originally omitted `type` |
| Fix | `0003_schema_reconcile.sql` adds `type` with default `'expense'` for empty rows |

## Apply order (after Agent 1 migrations)

```
0000_schema → 0000b → 0001_rls → 0002 → 0003_schema_reconcile
```

Then re-run [`scripts/audit_rls.sql`](scripts/audit_rls.sql) if policies were not changed (0003 is columns only).

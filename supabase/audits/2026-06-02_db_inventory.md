# Database Inventory — 2026-06-02

| Field | Value |
|---|---|
| Branch | `audit/hardening` |
| Auditor | Aaron |
| Status | **INVENTORY COMPLETE** — gap matrix filled; awaiting migration apply |
| Script used | `supabase/scripts/inventory_remote_db.sql` |

Complete this file **before** running `0000_schema.sql` or `0001_rls.sql`. Paste **metadata only** (table names, columns, policy names). Do not paste user row data or API keys.

## App requirements (repo reference)

| Table | Used by app today? |
|---|---|
| `transactions` | Yes |
| `categories` | Yes |
| `wallets` | Yes |
| `budgets` | Yes |
| `goals` | Yes |
| `profiles` | No (settings uses auth metadata) |
| `notifications` | No (mock data) |
| `notification_settings` | No |

Minimum for app: **5 tables**. Full spec: **8 tables + 32 RLS policies**.

---

## Query A — All public tables

_Paste results from inventory query A._

```
| table_name   |
| ------------ |
| budgets      |
| categories   |
| goals        |
| terms        |
| transactions |
| wallets      |
```

Extra tables not in the 8-table spec (document only; do not drop without decision):

| table_name | Notes |
|---|---|
| `terms` | Present in live DB; not referenced in app code. Purpose unknown — document only, do not drop without decision |

---

## Query B — Expected 8 table existence

_Paste results from inventory query B._

| table_name | exists | Pass? |
|---|---|---|
| profiles | false | No — missing |
| categories | true | Yes |
| wallets | true | Yes |
| transactions | true | Yes |
| budgets | true | Yes |
| goals | true | Yes |
| notifications | false | No — missing |
| notification_settings | false | No — missing |

Missing tables (exists = false):

- `profiles`
- `notifications`
- `notification_settings`

## Query C — Column inventory

_Paste results from inventory query C, or summarize drift per table._

### Known drift to check

| Table | Column | In repo spec? | In live DB? | Notes |
|---|---|---|---|---|
| `transactions` | `status` | Added in `0000_schema.sql` | **Yes** | Default `'active'` — no action needed |
| `goals` | `deadline` | Yes | **Yes** | `lib/types.ts` uses `due_date` (type-only drift in app) |
| `budgets` | `name` | Yes (`NOT NULL`) | **No** | App reads `budget.name` in UI; inserts omit it today — optional `ADD COLUMN` |
| `categories` | `description` | Yes | **No** | Live has `type` instead — **app requires `type`**; do not replace with repo spec |
| `categories` | `type` | No (repo gap) | **Yes** | Required by categories page — live DB is correct for app |
| `categories` | `icon` / `color` | `NOT NULL` in repo | Nullable in live | Low risk; no migration required unless enforcing constraints |

| table_name   | column_name         | data_type                | is_nullable | column_default     |
| ------------ | ------------------- | ------------------------ | ----------- | ------------------ |
| budgets      | id                  | uuid                     | NO          | uuid_generate_v4() |
| budgets      | user_id             | uuid                     | NO          | null               |
| budgets      | amount              | numeric                  | NO          | null               |
| budgets      | category_id         | uuid                     | NO          | null               |
| budgets      | period              | text                     | NO          | null               |
| budgets      | start_date          | timestamp with time zone | NO          | null               |
| budgets      | end_date            | timestamp with time zone | YES         | null               |
| budgets      | notes               | text                     | YES         | null               |
| budgets      | created_at          | timestamp with time zone | YES         | now()              |
| budgets      | updated_at          | timestamp with time zone | YES         | now()              |
| categories   | id                  | uuid                     | NO          | uuid_generate_v4() |
| categories   | user_id             | uuid                     | NO          | null               |
| categories   | name                | text                     | NO          | null               |
| categories   | icon                | text                     | YES         | null               |
| categories   | color               | text                     | YES         | null               |
| categories   | type                | text                     | YES         | null               |
| categories   | created_at          | timestamp with time zone | YES         | now()              |
| categories   | updated_at          | timestamp with time zone | YES         | now()              |
| goals        | id                  | uuid                     | NO          | uuid_generate_v4() |
| goals        | user_id             | uuid                     | NO          | null               |
| goals        | name                | text                     | NO          | null               |
| goals        | target_amount       | numeric                  | NO          | null               |
| goals        | current_amount      | numeric                  | YES         | 0                  |
| goals        | deadline            | timestamp with time zone | YES         | null               |
| goals        | category_id         | uuid                     | YES         | null               |
| goals        | wallet_id           | uuid                     | YES         | null               |
| goals        | color               | text                     | YES         | null               |
| goals        | icon                | text                     | YES         | null               |
| goals        | notes               | text                     | YES         | null               |
| goals        | created_at          | timestamp with time zone | YES         | now()              |
| goals        | updated_at          | timestamp with time zone | YES         | now()              |
| transactions | id                  | uuid                     | NO          | uuid_generate_v4() |
| transactions | user_id             | uuid                     | NO          | null               |
| transactions | type                | text                     | NO          | null               |
| transactions | name                | text                     | NO          | null               |
| transactions | amount              | numeric                  | NO          | null               |
| transactions | description         | text                     | YES         | null               |
| transactions | category_id         | uuid                     | YES         | null               |
| transactions | wallet_id           | uuid                     | NO          | null               |
| transactions | date                | timestamp with time zone | YES         | now()              |
| transactions | recurring           | boolean                  | YES         | false              |
| transactions | recurring_frequency | text                     | YES         | null               |
| transactions | notes               | text                     | YES         | null               |
| transactions | created_at          | timestamp with time zone | YES         | now()              |
| transactions | updated_at          | timestamp with time zone | YES         | now()              |
| transactions | status              | text                     | YES         | 'active'::text     |
| wallets      | id                  | uuid                     | NO          | uuid_generate_v4() |
| wallets      | user_id             | uuid                     | NO          | null               |
| wallets      | name                | text                     | NO          | null               |
| wallets      | type                | text                     | NO          | null               |
| wallets      | balance             | numeric                  | YES         | 0                  |
| wallets      | currency            | text                     | YES         | 'USD'::text        |
| wallets      | color               | text                     | YES         | null               |
| wallets      | icon                | text                     | YES         | null               |
| wallets      | include_in_total    | boolean                  | YES         | true               |
| wallets      | notes               | text                     | YES         | null               |
| wallets      | created_at          | timestamp with time zone | YES         | now()              |
| wallets      | updated_at          | timestamp with time zone | YES         | now()              |

### Per-table column notes

**categories**: Live has `type` (used by app); repo `billa_schema.sql` lists `description` instead — treat live as source of truth.

**wallets**: Matches app usage; no blocking drift.

**transactions**: Has both `description` and `notes`; `status` present — cancel flow supported.

**budgets**: Missing `name` column vs repo spec; app insert does not send `name` today but UI reads it (may show blank).

**goals**: Aligns with repo; `deadline` present.


---

## Query D — RLS and policies

### D1 — RLS enabled

| table_name   | rls_enabled | rls_forced |
| ------------ | ----------- | ---------- |
| budgets      | true        | false      |
| categories   | true        | false      |
| goals        | true        | false      |
| transactions | true        | false      |
| wallets      | true        | false      |

### D2 — Policy inventory

_Paste policy names, commands, roles, and expressions from query D2._

```
| tablename    | policyname                                          | cmd    | roles           | using_expression                                              | with_check_expression                                                                      |
| ------------ | --------------------------------------------------- | ------ | --------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| budgets      | Users can delete their budgets                      | DELETE | {authenticated} | (user_id = auth.uid())                                        | null                                                                                       |
| budgets      | Users can insert budgets                            | INSERT | {authenticated} | null                                                          | (user_id = auth.uid())                                                                     |
| budgets      | Users can read their own budgets                    | SELECT | {authenticated} | (user_id = auth.uid())                                        | null                                                                                       |
| budgets      | Users can update their budgets                      | UPDATE | {authenticated} | (user_id = auth.uid())                                        | (user_id = auth.uid())                                                                     |
| categories   | Authenticated users can delete their own categories | DELETE | {authenticated} | (user_id = auth.uid())                                        | null                                                                                       |
| categories   | Users can insert their own categories               | INSERT | {authenticated} | null                                                          | (user_id = auth.uid())                                                                     |
| categories   | Users can fetch their own categories                | SELECT | {authenticated} | (user_id = auth.uid())                                        | null                                                                                       |
| categories   | Users can update their own categories               | UPDATE | {authenticated} | (user_id = auth.uid())                                        | (user_id = auth.uid())                                                                     |
| goals        | Insert own goals                                    | INSERT | {authenticated} | null                                                          | (user_id = auth.uid())                                                                     |
| goals        | Delete own goals                                    | SELECT | {authenticated} | (user_id = auth.uid())                                        | null                                                                                       |
| goals        | Select own goals                                    | SELECT | {authenticated} | (user_id = auth.uid())                                        | null                                                                                       |
| goals        | Update own goals                                    | UPDATE | {authenticated} | (user_id = auth.uid())                                        | (user_id = auth.uid())                                                                     |
| transactions | Users can insert into their wallets                 | INSERT | {public}        | null                                                          | (wallet_id IN ( SELECT wallets.id
   FROM wallets
  WHERE (wallets.user_id = auth.uid()))) |
| transactions | Users can insert their transactions                 | INSERT | {public}        | null                                                          | (user_id = auth.uid())                                                                     |
| transactions | Users can fetch their transactions                  | SELECT | {authenticated} | (user_id = auth.uid())                                        | null                                                                                       |
| transactions | Users cannot delete transactions                    | SELECT | {public}        | false                                                         | null                                                                                       |
| transactions | Users can only update their own transactions        | UPDATE | {public}        | (user_id = auth.uid())                                        | null                                                                                       |
| wallets      | Users can delete their wallets                      | DELETE | {authenticated} | (auth.uid() = user_id)                                        | null                                                                                       |
| wallets      | Users can insert their own wallets                  | INSERT | {authenticated} | null                                                          | (user_id = auth.uid())                                                                     |
| wallets      | Users can view their wallets                        | SELECT | {authenticated} | (user_id = auth.uid())                                        | null                                                                                       |
| wallets      | Users cannot update wallet balance manually         | UPDATE | {public}        | ((auth.uid() = user_id) OR (CURRENT_USER = 'postgres'::name)) | ((auth.uid() = user_id) OR (CURRENT_USER = 'postgres'::name))                              |
```

Legacy policy names (not matching `{table}_select_own` pattern):

- `budgets`: Users can delete their budgets; Users can insert budgets; Users can read their own budgets; Users can update their budgets
- `categories`: Authenticated users can delete their own categories; Users can insert their own categories; Users can fetch their own categories; Users can update their own categories
- `goals`: Insert own goals; Delete own goals; Select own goals; Update own goals
- `transactions`: Users can insert into their wallets; Users can insert their transactions; Users can fetch their transactions; Users cannot delete transactions; Users can only update their own transactions
- `wallets`: Users can delete their wallets; Users can insert their own wallets; Users can view their wallets; Users cannot update wallet balance manually

**Policy issues on existing tables:**

| Table | Issue |
|---|---|
| `goals` | D2 lists `Delete own goals` with `cmd = SELECT` — verify in dashboard; may be export quirk or missing DELETE policy |
| `transactions` | 5 policies (expected 4); several use role `{public}` not `{authenticated}`; no DELETE policy (may be intentional via deny SELECT) |
| `wallets` | Legacy UPDATE policy blocked manual balance (by name); replaced by `0002_wallet_balance_from_transactions.sql` triggers after migration |
| All 5 tables | Legacy names differ from `0001_rls.sql` — running `0001_rls` without dropping legacy policies will **duplicate** policies |

### D3 — Policy count per table

| tablename | policy_count | Expected | Pass? |
|---|---|---|---|
| profiles | — | 4 | N/A (table missing) |
| categories | 4 | 4 | Yes (expressions OK; legacy names) |
| wallets | 4 | 4 | Yes (legacy names; special UPDATE deny) |
| transactions | 5 | 4 | No (extra policy; `{public}` role mix) |
| budgets | 4 | 4 | Yes (legacy names) |
| goals | 4 | 4 | Verify DELETE — see D2 note |
| notifications | — | 4 | N/A (table missing) |
| notification_settings | — | 4 | N/A (table missing) |

### D4 — Grand total

```
total_policies: 21
| total_policies |
| -------------- |
| 21             |
```

Expected if all 8 tables exist: **32**

---

## Query E — Policies on other public tables

_Success. No rows returned

---

## Gap matrix

| Item | Expected | Live | Action |
|---|---|---|---|
| Table `profiles` | exists | **missing** | Run `0000_schema.sql` (creates table; app does not use yet) |
| Table `notifications` | exists | **missing** | Run `0000_schema.sql` (future feature) |
| Table `notification_settings` | exists | **missing** | Run `0000_schema.sql` (future feature) |
| Table `terms` | not in spec | **exists** | Document only — do not drop without decision |
| Tables `budgets`, `categories`, `goals`, `transactions`, `wallets` | exists | **present** | No `0000` CREATE needed for these five |
| Column `transactions.status` | exists | **present** | No action |
| Column `goals.deadline` | exists | **present** | No action |
| Column `budgets.name` | NOT NULL in repo | **missing** | Optional: `ALTER TABLE budgets ADD COLUMN IF NOT EXISTS name TEXT` — not in `0000_schema` today |
| Column `categories.type` | app requires | **present** | Keep live column; update repo schema docs later (out of scope) |
| Column `categories.description` | in repo spec | **missing** | No action — live `type` is correct for app |
| RLS on 5 app tables | enabled | **enabled** | Pass |
| RLS on `profiles`, `notifications`, `notification_settings` | enabled | **N/A** | Enable via `0001_rls.sql` after `0000_schema` |
| Policies on 5 app tables | 4 each, `{authenticated}`, `auth.uid()` | **21 total**, legacy names | Drop legacy policies first, then run `0001_rls.sql` |
| `transactions` DELETE | spec includes delete_own | **no DELETE policy** | `0001_rls` adds `transactions_delete_own` after legacy drop |
| `transactions` `{public}` policies | `{authenticated}` only | **3 policies use `{public}`** | Reconcile via legacy drop + `0001_rls` |
| `goals` DELETE policy | DELETE cmd | **unclear** (D2 shows SELECT for "Delete own goals") | Verify in dashboard; `0001_rls` adds standardized delete policy |
| Total policies (full 8-table spec) | 32 | **21** (5 tables only) | After `0000` + legacy drop + `0001`: expect 32 |
| Wallet balance edits | via transactions only | legacy policy (dropped in `0000b`) | Run `0002_wallet_balance_from_transactions.sql` after `0001_rls` |

---

## Migration plan (fill after gap matrix)

- [x] Run `migrations/0000_schema.sql` — **reason:** create missing `profiles`, `notifications`, `notification_settings` (`CREATE TABLE IF NOT EXISTS` only; safe on existing 5 tables)
- [x] Run `migrations/0000b_drop_legacy_policies.sql` — **reason:** drop 21 legacy policies listed in D2 **before** `0001_rls` (otherwise policies duplicate)
- [x] Run `migrations/0001_rls.sql` — **reason:** add 12 policies on 3 new tables + replace 5 existing tables with standardized `{table}_*_own` policies (only after legacy drop)
- [ ] Skip migrations — not applicable; gaps documented above
- [ ] Optional: `ALTER TABLE budgets ADD COLUMN IF NOT EXISTS name TEXT` — UI reads `budget.name` but inserts omit it today

- [x] Run `migrations/0002_wallet_balance_from_transactions.sql` — **reason:** block manual balance edits; sync balance from transactions (replaces legacy wallet UPDATE policy intent)
- [x] Run `migrations/0003_schema_reconcile.sql` — **reason:** add `budgets.name`, `goals.due_date`, `categories.type` where missing (see [`SCHEMA_DRIFT.md`](../SCHEMA_DRIFT.md))

**Apply order:** `0000_schema` → `0000b_drop_legacy_policies` → `0001_rls` → `0002_wallet_balance_from_transactions` → `0003_schema_reconcile` → re-run `audit_rls.sql`

---

## Go / no-go for Agent 1 retry

- [x] Inventory sections A–E complete
- [x] Gap matrix filled
- [x] Migration plan decided
- [x] **GO** — proceed with documented migrations only (`0000` → `0000b` → `0001` → `0002`)
- [ ] **NO-GO** — block until: _(n/a)_

Completed date: 2026-06-02

Next step after GO: run migrations in order above → `scripts/audit_rls.sql` → `audits/2026-06-02_rls_audit.md`

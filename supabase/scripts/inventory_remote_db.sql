-- Billa remote database inventory (read-only)
-- Run in Supabase Dashboard → SQL Editor BEFORE any migrations.
-- Safe to commit: metadata only (no user rows).
-- Paste results into supabase/audits/2026-06-02_db_inventory.md
--
-- Workflow:
--   inventory_remote_db.sql → db_inventory.md → 0000_schema (if needed) → 0001_rls (if needed)

-- =============================================================================
-- A) All public tables
-- Discover anything beyond the 8 expected application tables.
-- =============================================================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =============================================================================
-- B) Expected table existence
-- If any row shows exists = false, note in db_inventory.md before migrations.
-- =============================================================================
SELECT
  expected.table_name,
  EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname = expected.table_name
  ) AS exists
FROM (
  VALUES
    ('profiles'),
    ('categories'),
    ('wallets'),
    ('transactions'),
    ('budgets'),
    ('goals'),
    ('notifications'),
    ('notification_settings')
) AS expected(table_name)
ORDER BY expected.table_name;

-- =============================================================================
-- C) Columns on expected tables (only returns rows for tables that exist)
-- Compare to billa_schema.sql and migrations/0000_schema.sql
-- Known likely drift: transactions.status (app uses it; older schema may omit it)
-- =============================================================================
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'profiles',
    'categories',
    'wallets',
    'transactions',
    'budgets',
    'goals',
    'notifications',
    'notification_settings'
  )
ORDER BY table_name, ordinal_position;

-- =============================================================================
-- D1) RLS enabled per expected table (only existing tables return rows)
-- =============================================================================
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN (
    'profiles',
    'categories',
    'wallets',
    'transactions',
    'budgets',
    'goals',
    'notifications',
    'notification_settings'
  )
ORDER BY c.relname;

-- =============================================================================
-- D2) Policy inventory (all policies on expected tables)
-- Expected spec: auth.uid() = id on profiles; auth.uid() = user_id on others
-- Expected roles: {authenticated}
-- =============================================================================
SELECT
  tablename,
  policyname,
  cmd,
  roles,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'categories',
    'wallets',
    'transactions',
    'budgets',
    'goals',
    'notifications',
    'notification_settings'
  )
ORDER BY tablename, cmd, policyname;

-- =============================================================================
-- D3) Policy count per table
-- Expected: 4 per existing table (SELECT, INSERT, UPDATE, DELETE)
-- =============================================================================
SELECT
  tablename,
  COUNT(*) AS policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'categories',
    'wallets',
    'transactions',
    'budgets',
    'goals',
    'notifications',
    'notification_settings'
  )
GROUP BY tablename
ORDER BY tablename;

-- =============================================================================
-- D4) Grand total policies on expected tables
-- Full spec (8 tables): 32. Partial DB will show fewer.
-- =============================================================================
SELECT COUNT(*) AS total_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'categories',
    'wallets',
    'transactions',
    'budgets',
    'goals',
    'notifications',
    'notification_settings'
  );

-- =============================================================================
-- E) Policies on OTHER public tables (not in the 8-table spec)
-- Document these in db_inventory.md; do not drop without explicit decision.
-- =============================================================================
SELECT
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename NOT IN (
    'profiles',
    'categories',
    'wallets',
    'transactions',
    'budgets',
    'goals',
    'notifications',
    'notification_settings'
  )
ORDER BY tablename, policyname;

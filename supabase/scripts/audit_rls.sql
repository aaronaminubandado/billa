-- Billa RLS audit (read-only)
-- Run in Supabase Dashboard → SQL Editor.
-- Safe to commit: queries metadata only (no user rows).
-- Paste sanitized results into supabase/audits/YYYY-MM-DD_rls_audit.md

-- ---------------------------------------------------------------------------
-- 0) Which expected tables exist?
-- Run this FIRST. If any show exists = false, run migrations/0000_schema.sql
-- before migrations/0001_rls.sql.
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 1) RLS enabled per application table
-- Expected: rls_enabled = true for all 8 tables
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 2) Policy inventory
-- Expected: 4 policies per table (SELECT, INSERT, UPDATE, DELETE) = 32 total
-- Expected expressions:
--   profiles              → auth.uid() = id
--   all other tables      → auth.uid() = user_id
-- Expected roles: {authenticated}
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 3) Summary: policy count per table
-- Expected: policy_count = 4 for each table, total_policies = 32
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 4) Grand total
-- Expected: total_policies = 32
-- ---------------------------------------------------------------------------
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

-- Billa legacy RLS policy cleanup
-- Branch: audit/hardening
-- Source: supabase/audits/2026-06-02_db_inventory.md (21 policies on 5 tables)
--
-- Run AFTER:  migrations/0000_schema.sql (if missing tables were created)
-- Run BEFORE: migrations/0001_rls.sql
--
-- Idempotent: DROP POLICY IF EXISTS — safe to re-run.
-- Does NOT contain secrets.

-- =============================================================================
-- budgets (4 policies)
-- =============================================================================

DROP POLICY IF EXISTS "Users can delete their budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can read their own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update their budgets" ON public.budgets;

-- =============================================================================
-- categories (4 policies)
-- =============================================================================

DROP POLICY IF EXISTS "Authenticated users can delete their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can fetch their own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.categories;

-- =============================================================================
-- goals (4 policies)
-- =============================================================================

DROP POLICY IF EXISTS "Insert own goals" ON public.goals;
DROP POLICY IF EXISTS "Delete own goals" ON public.goals;
DROP POLICY IF EXISTS "Select own goals" ON public.goals;
DROP POLICY IF EXISTS "Update own goals" ON public.goals;

-- =============================================================================
-- transactions (5 policies)
-- =============================================================================

DROP POLICY IF EXISTS "Users can insert into their wallets" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can fetch their transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users cannot delete transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can only update their own transactions" ON public.transactions;

-- =============================================================================
-- wallets (4 policies)
-- =============================================================================

DROP POLICY IF EXISTS "Users can delete their wallets" ON public.wallets;
DROP POLICY IF EXISTS "Users can insert their own wallets" ON public.wallets;
DROP POLICY IF EXISTS "Users can view their wallets" ON public.wallets;
DROP POLICY IF EXISTS "Users cannot update wallet balance manually" ON public.wallets;

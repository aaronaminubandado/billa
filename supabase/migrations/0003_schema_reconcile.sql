-- Reconcile live DB drift documented in SCHEMA_DRIFT.md
-- Safe/idempotent: ADD COLUMN IF NOT EXISTS only

-- App UI reads budget.name; live DB may lack the column
ALTER TABLE public.budgets
  ADD COLUMN IF NOT EXISTS name TEXT;

UPDATE public.budgets
SET name = 'Budget'
WHERE name IS NULL;

-- App writes due_date; live DB may use deadline column name
ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;

UPDATE public.goals
SET due_date = deadline
WHERE due_date IS NULL AND deadline IS NOT NULL;

-- Live DB uses categories.type (required by app); repo 0000_schema omits it
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS type TEXT;

UPDATE public.categories
SET type = 'expense'
WHERE type IS NULL;

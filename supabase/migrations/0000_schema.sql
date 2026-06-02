-- Billa base schema (tables only, no RLS)
-- Branch: audit/hardening
-- Canonical source: billa_schema.sql
--
-- Run this BEFORE migrations/0001_rls.sql if audit shows missing tables.
-- Idempotent: CREATE TABLE IF NOT EXISTS — safe on databases that already have some tables.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (app uses auth.user_metadata today; table reserved for future use)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  name TEXT,
  avatar_url TEXT,
  preferred_currency TEXT DEFAULT 'USD',
  theme TEXT DEFAULT 'system',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance DECIMAL(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  color TEXT,
  icon TEXT,
  include_in_total BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  wallet_id UUID REFERENCES public.wallets(id) NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  category_id UUID REFERENCES public.categories(id) NOT NULL,
  period TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  target_amount DECIMAL(12, 2) NOT NULL,
  current_amount DECIMAL(12, 2) DEFAULT 0,
  deadline TIMESTAMPTZ,
  category_id UUID REFERENCES public.categories(id),
  wallet_id UUID REFERENCES public.wallets(id),
  color TEXT,
  icon TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notification_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  notification_types JSONB DEFAULT '["budget_alerts", "goal_progress", "recurring_transactions"]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: app writes transactions.status = 'canceled' but column may be missing on older DBs.
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Billa wallet balance guard + transaction sync
-- Branch: audit/hardening
--
-- Run AFTER: migrations/0001_rls.sql
--
-- Replaces the intent of legacy policy "Users cannot update wallet balance manually":
--   - Users may UPDATE wallet metadata (name, type, currency, etc.)
--   - Users may NOT change wallets.balance directly
--   - Balance changes only via transaction INSERT/UPDATE/DELETE triggers
--
-- Opening balance on wallet INSERT is still allowed (initial balance field).

-- =============================================================================
-- Helpers
-- =============================================================================

CREATE OR REPLACE FUNCTION public.transaction_balance_delta(
  p_type TEXT,
  p_amount NUMERIC,
  p_status TEXT
)
RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_status = 'canceled' THEN 0
    WHEN p_type = 'income' THEN p_amount
    WHEN p_type = 'expense' THEN -p_amount
    ELSE 0
  END;
$$;

CREATE OR REPLACE FUNCTION public.apply_wallet_balance_delta(
  p_wallet_id UUID,
  p_delta NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_wallet_id IS NULL OR p_delta = 0 THEN
    RETURN;
  END IF;

  PERFORM set_config('billa.wallet_balance_sync', 'on', true);

  UPDATE public.wallets
  SET balance = balance + p_delta,
      updated_at = NOW()
  WHERE id = p_wallet_id;

  PERFORM set_config('billa.wallet_balance_sync', 'off', true);
END;
$$;

REVOKE ALL ON FUNCTION public.transaction_balance_delta(TEXT, NUMERIC, TEXT)
  FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION public.apply_wallet_balance_delta(UUID, NUMERIC)
  FROM PUBLIC, anon, authenticated;

-- =============================================================================
-- Block manual balance edits on wallets (allow sync from transaction triggers)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.prevent_manual_wallet_balance_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_setting('billa.wallet_balance_sync', true) = 'on' THEN
    RETURN NEW;
  END IF;

  IF NEW.balance IS DISTINCT FROM OLD.balance THEN
    RAISE EXCEPTION
      'Wallet balance cannot be updated manually. It is calculated from transactions.';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.prevent_manual_wallet_balance_update()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS wallets_prevent_manual_balance_update ON public.wallets;

CREATE TRIGGER wallets_prevent_manual_balance_update
  BEFORE UPDATE OF balance ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_manual_wallet_balance_update();

-- =============================================================================
-- Sync wallet balance when transactions change
-- =============================================================================

CREATE OR REPLACE FUNCTION public.sync_wallet_balance_from_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_delta NUMERIC;
  new_delta NUMERIC;
BEGIN
  IF TG_OP = 'INSERT' THEN
    new_delta := public.transaction_balance_delta(NEW.type, NEW.amount, NEW.status);
    PERFORM public.apply_wallet_balance_delta(NEW.wallet_id, new_delta);
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    old_delta := public.transaction_balance_delta(OLD.type, OLD.amount, OLD.status);
    PERFORM public.apply_wallet_balance_delta(OLD.wallet_id, -old_delta);
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    old_delta := public.transaction_balance_delta(OLD.type, OLD.amount, OLD.status);
    new_delta := public.transaction_balance_delta(NEW.type, NEW.amount, NEW.status);

    IF OLD.wallet_id IS DISTINCT FROM NEW.wallet_id THEN
      PERFORM public.apply_wallet_balance_delta(OLD.wallet_id, -old_delta);
      PERFORM public.apply_wallet_balance_delta(NEW.wallet_id, new_delta);
    ELSE
      PERFORM public.apply_wallet_balance_delta(NEW.wallet_id, new_delta - old_delta);
    END IF;

    RETURN NEW;
  END IF;

  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_wallet_balance_from_transaction()
  FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS transactions_sync_wallet_balance ON public.transactions;

CREATE TRIGGER transactions_sync_wallet_balance
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_wallet_balance_from_transaction();

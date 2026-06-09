import type { SupabaseClient } from "@supabase/supabase-js";
import { getOverviewFetchRange } from "@/lib/utils";
import { requireUserId } from "@/lib/data/auth";
import type {
  Category,
  NewTransactionPayload,
  Transaction,
  Wallet,
} from "@/lib/types";

export interface DashboardCategory {
  id: string;
  name: string;
  color: string;
  icon: string | null;
}

export interface DashboardTransaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  category_id: string | null;
  created_at: string;
  categories: DashboardCategory | null;
}

export async function listDashboardTransactions(
  supabase: SupabaseClient,
  timePeriod: string
): Promise<DashboardTransaction[]> {
  const userId = await requireUserId(supabase);
  const { start, end } = getOverviewFetchRange(timePeriod);

  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      id,
      amount,
      type,
      category_id,
      created_at,
      category:categories ( id, name, color, icon )
    `
    )
    .eq("user_id", userId)
    .gte("created_at", start)
    .lte("created_at", end);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => {
    const category = Array.isArray(row.category)
      ? row.category[0] ?? null
      : row.category ?? null;

    return {
      id: row.id as string,
      amount: row.amount as number,
      type: row.type as DashboardTransaction["type"],
      category_id: row.category_id as string | null,
      created_at: row.created_at as string,
      categories: category as DashboardCategory | null,
    };
  });
}

export async function listTransactionsWithRelations(
  supabase: SupabaseClient
): Promise<Transaction[]> {
  const userId = await requireUserId(supabase);

  const { data, error } = await supabase
    .from("transactions")
    .select(
      `
      *,
      category:categories ( id, name, icon, color ),
      wallet:wallets ( id, name, type, balance, color )
    `
    )
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Transaction[];
}

export async function insertTransaction(
  supabase: SupabaseClient,
  payload: NewTransactionPayload
) {
  const userId = await requireUserId(supabase);

  const { error } = await supabase
    .from("transactions")
    .insert([{ ...payload, user_id: userId }]);

  if (error) {
    throw error;
  }
}

export async function updateTransaction(
  supabase: SupabaseClient,
  transaction: Transaction
) {
  const userId = await requireUserId(supabase);
  const { category, wallet, ...transactionColumns } = transaction;
  void category;
  void wallet;

  const { error } = await supabase
    .from("transactions")
    .update({
      ...transactionColumns,
      category_id: transaction.category_id,
      wallet_id: transaction.wallet_id,
    })
    .eq("id", transaction.id)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function cancelTransaction(
  supabase: SupabaseClient,
  transactionId: string
) {
  const userId = await requireUserId(supabase);

  const { error } = await supabase
    .from("transactions")
    .update({ status: "canceled" })
    .eq("id", transactionId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function listCategoriesForUser(
  supabase: SupabaseClient
): Promise<Category[]> {
  const userId = await requireUserId(supabase);

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return (data ?? []) as Category[];
}

export async function listWalletsForUser(
  supabase: SupabaseClient
): Promise<Wallet[]> {
  const userId = await requireUserId(supabase);

  const { data, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return (data ?? []) as Wallet[];
}

export async function listRecentByWallet(
  supabase: SupabaseClient,
  walletId: string,
  limit = 3
) {
  const userId = await requireUserId(supabase);

  const { data, error } = await supabase
    .from("transactions")
    .select("id, name, amount, type, created_at")
    .eq("user_id", userId)
    .eq("wallet_id", walletId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function walletHasTransactions(
  supabase: SupabaseClient,
  walletId: string
) {
  const userId = await requireUserId(supabase);

  const { data, error } = await supabase
    .from("transactions")
    .select("id")
    .eq("user_id", userId)
    .eq("wallet_id", walletId)
    .limit(1);

  if (error) {
    throw error;
  }

  return (data?.length ?? 0) > 0;
}

export async function sumWalletBalance(
  supabase: SupabaseClient,
  walletId: string
) {
  const userId = await requireUserId(supabase);

  const { data, error } = await supabase
    .from("transactions")
    .select("amount")
    .eq("user_id", userId)
    .eq("wallet_id", walletId);

  if (error) {
    throw error;
  }

  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
}

export async function sumCategoryExpensesInPeriod(
  supabase: SupabaseClient,
  categoryId: string,
  rangeStart: Date,
  rangeEnd: Date
) {
  const userId = await requireUserId(supabase);

  const { data, error } = await supabase
    .from("transactions")
    .select("amount, type, status")
    .eq("user_id", userId)
    .eq("category_id", categoryId)
    .eq("status", "active")
    .eq("type", "expense")
    .gte("created_at", rangeStart.toISOString())
    .lte("created_at", rangeEnd.toISOString());

  if (error) {
    throw error;
  }

  return (data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
}

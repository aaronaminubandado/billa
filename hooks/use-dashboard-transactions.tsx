"use client";

import { useEffect, useState } from "react";
import { getOverviewFetchRange } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

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

export function useDashboardTransactions(timePeriod: string) {
  const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    const load = async () => {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setTransactions([]);
          setLoading(false);
        }
        return;
      }

      const { start, end } = getOverviewFetchRange(timePeriod);

      const { data, error: fetchError } = await supabase
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
        .eq("user_id", user.id)
        .gte("created_at", start)
        .lte("created_at", end);

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
        setTransactions([]);
        setLoading(false);
        return;
      }

      setTransactions(
        (data ?? []).map((row) => {
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
        })
      );
      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [timePeriod]);

  return { transactions, loading, error };
}

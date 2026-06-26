"use client";

import { useEffect, useState } from "react";
import { getOverviewFetchRange } from "@/lib/utils";
import {
	listDashboardTransactions,
	type DashboardTransaction,
} from "@/lib/data/transactions";
import { createClient } from "@/utils/supabase/client";

export type { DashboardTransaction } from "@/lib/data/transactions";

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

      try {
        const data = await listDashboardTransactions(supabase, timePeriod);
        if (!cancelled) {
          setTransactions(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load transactions");
          setTransactions([]);
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [timePeriod]);

  return { transactions, loading, error };
}

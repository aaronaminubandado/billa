"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  ActivityIcon,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/lib/types";

interface TransactionsSummaryProps {
  transactions: Transaction[];
}

export function TransactionsSummary({
  transactions,
}: TransactionsSummaryProps) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netAmount = totalIncome - totalExpenses;
  const transactionCount = transactions.length;

  const now = new Date();
  const thisMonthTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const thisMonthIncome = thisMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthExpenses = thisMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const cards = [
    {
      label: "Total Income",
      value: formatCurrency(totalIncome),
      sub: `This month: ${formatCurrency(thisMonthIncome)}`,
      icon: TrendingUpIcon,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-500/10",
    },
    {
      label: "Total Expenses",
      value: formatCurrency(totalExpenses),
      sub: `This month: ${formatCurrency(thisMonthExpenses)}`,
      icon: TrendingDownIcon,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-100 dark:bg-rose-500/10",
    },
    {
      label: "Net Amount",
      value: formatCurrency(netAmount),
      sub: netAmount >= 0 ? "Surplus" : "Deficit",
      icon: DollarSignIcon,
      color: netAmount >= 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-rose-600 dark:text-rose-400",
      bg: netAmount >= 0
        ? "bg-emerald-100 dark:bg-emerald-500/10"
        : "bg-rose-100 dark:bg-rose-500/10",
    },
    {
      label: "Transactions",
      value: transactionCount.toString(),
      sub: `This month: ${thisMonthTransactions.length}`,
      icon: ActivityIcon,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 min-w-0">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {card.label}
                </p>
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", card.bg)}>
                  <Icon className={cn("h-4 w-4", card.color)} />
                </div>
              </div>
              <p className={cn("text-xl font-bold", card.color)}>
                {card.value}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">{card.sub}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

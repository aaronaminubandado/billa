"use client";

import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
	ArrowUpIcon,
	ArrowDownIcon,
	DollarSignIcon,
	PiggyBankIcon,
} from "lucide-react";
import { cn, formatCurrency, getDateRange } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardTransaction } from "@/hooks/use-dashboard-transactions";

interface DashboardMetricsProps {
	timePeriod: string;
	transactions: DashboardTransaction[];
	loading?: boolean;
}

interface MetricsData {
	totalIncome: number;
	totalExpenses: number;
	balance: number;
	savingsRate: number;
	topExpenseCategory: string;
	topExpenseAmount: number;
	incomeChange: number;
	expensesChange: number;
}

function computeMetrics(
	transactions: DashboardTransaction[],
	timePeriod: string
): MetricsData | null {
	const { start, end } = getDateRange(timePeriod);
	const startMs = new Date(start).getTime();
	const endMs = new Date(end).getTime();

	const inRange = transactions.filter((t) => {
		const created = new Date(t.created_at).getTime();
		return created >= startMs && created <= endMs;
	});

	let totalIncome = 0;
	let totalExpenses = 0;
	const categoryTotals: Record<string, number> = {};

	inRange.forEach((t) => {
		if (t.type === "income") {
			totalIncome += t.amount;
		} else if (t.type === "expense") {
			totalExpenses += t.amount;
			const catName = t.categories?.name ?? "Unknown";
			categoryTotals[catName] = (categoryTotals[catName] || 0) + t.amount;
		}
	});

	const balance = totalIncome - totalExpenses;
	const savingsRate =
		totalIncome > 0 ? Number(((balance / totalIncome) * 100).toFixed(1)) : 0;

	let topExpenseCategory = "None";
	let topExpenseAmount = 0;
	for (const [cat, amt] of Object.entries(categoryTotals)) {
		if (amt > topExpenseAmount) {
			topExpenseCategory = cat;
			topExpenseAmount = amt;
		}
	}

	return {
		totalIncome,
		totalExpenses,
		balance,
		savingsRate,
		topExpenseCategory,
		topExpenseAmount,
		incomeChange: 0,
		expensesChange: 0,
	};
}

export function DashboardMetrics({
	timePeriod,
	transactions,
	loading = false,
}: DashboardMetricsProps) {
	const metrics = useMemo(
		() => computeMetrics(transactions, timePeriod),
		[transactions, timePeriod]
	);

	if (loading) {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{[...Array(4)].map((_, i) => (
					<Card key={i} className="overflow-hidden">
						<CardContent className="p-5">
							<div className="flex items-center justify-between">
								<div className="space-y-2 flex-1">
									<Skeleton className="h-3.5 w-24" />
									<Skeleton className="h-7 w-32" />
								</div>
								<Skeleton className="h-11 w-11 rounded-xl" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	if (!metrics) {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{[...Array(4)].map((_, i) => (
					<Card key={i}>
						<CardContent className="p-5 text-center text-muted-foreground text-sm">
							No data available
						</CardContent>
					</Card>
				))}
			</div>
		);
	}

	const metricCards = [
		{
			label: "Total Income",
			value: formatCurrency(metrics.totalIncome),
			icon: ArrowUpIcon,
			color: "text-emerald-600 dark:text-emerald-400",
			bg: "bg-emerald-100 dark:bg-emerald-500/10",
			trend: metrics.incomeChange,
		},
		{
			label: "Total Expenses",
			value: formatCurrency(metrics.totalExpenses),
			icon: ArrowDownIcon,
			color: "text-rose-600 dark:text-rose-400",
			bg: "bg-rose-100 dark:bg-rose-500/10",
			trend: metrics.expensesChange,
		},
		{
			label: "Net Balance",
			value: formatCurrency(metrics.balance),
			icon: DollarSignIcon,
			color: "text-blue-600 dark:text-blue-400",
			bg: "bg-blue-100 dark:bg-blue-500/10",
			trend: null,
		},
		{
			label: "Savings Rate",
			value: `${metrics.savingsRate}%`,
			icon: PiggyBankIcon,
			color: "text-violet-600 dark:text-violet-400",
			bg: "bg-violet-100 dark:bg-violet-500/10",
			subtitle: `Top: ${metrics.topExpenseCategory} (${formatCurrency(metrics.topExpenseAmount)})`,
		},
	];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
			{metricCards.map((card, idx) => {
				const Icon = card.icon;
				return (
					<Card
						key={idx}
						className="overflow-hidden transition-all duration-200 hover:shadow-md animate-slide-up"
						style={{ animationDelay: `${idx * 80}ms`, animationFillMode: "both" }}
					>
						<CardContent className="p-5">
							<div className="flex items-center justify-between">
								<div className="space-y-1.5 min-w-0">
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
										{card.label}
									</p>
									<p className="text-2xl font-bold tracking-tight">
										{card.value}
									</p>
								</div>
								<div
									className={cn(
										"h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0",
										card.bg
									)}
								>
									<Icon className={cn("h-5 w-5", card.color)} />
								</div>
							</div>
							{"subtitle" in card && card.subtitle && (
								<p className="mt-2.5 text-xs text-muted-foreground truncate">
									{card.subtitle}
								</p>
							)}
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

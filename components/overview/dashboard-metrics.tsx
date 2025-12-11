"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
	ArrowUpIcon,
	ArrowDownIcon,
	DollarSignIcon,
	TrendingUpIcon,
	TrendingDownIcon,
	PiggyBankIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

interface DashboardMetricsProps {
	timePeriod: string;
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

export function DashboardMetrics({ timePeriod }: DashboardMetricsProps) {
	const supabase = createClient();
	const [metrics, setMetrics] = useState<MetricsData | null>(null);

	// Convert timePeriods → date ranges
	const getDateRange = () => {
		const now = new Date();
		const start = new Date();

		switch (timePeriod) {
			case "week":
				start.setDate(now.getDate() - 7);
				break;
			case "month":
				start.setMonth(now.getMonth() - 1);
				break;
			case "quarter":
				start.setMonth(now.getMonth() - 3);
				break;
			case "year":
				start.setFullYear(now.getFullYear() - 1);
				break;
			default:
				start.setMonth(now.getMonth() - 1);
		}

		return { start: start.toISOString(), end: now.toISOString() };
	};

	const fetchMetrics = async () => {
		const { start, end } = getDateRange();

		// Fetch all transactions in the selected range
		const { data: transactions, error } = await supabase
			.from("transactions")
			.select("amount, type, category_id, categories(name)")
			.gte("created_at", start)
			.lte("created_at", end);

		if (error) {
			console.error(error);
			return;
		}

		let totalIncome = 0;
		let totalExpenses = 0;

		const categoryTotals: Record<string, number> = {};

		transactions.forEach((t: any) => {
			if (t.type === "income") {
				totalIncome += t.amount;
			} else if (t.type === "expense") {
				totalExpenses += t.amount;

				const catName = t.categories?.name ?? "Unknown";
				categoryTotals[catName] =
					(categoryTotals[catName] || 0) + t.amount;
			}
		});

		const balance = totalIncome - totalExpenses;
		const savingsRate =
			totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

		// Get largest category
		let topExpenseCategory = "None";
		let topExpenseAmount = 0;

		for (const [cat, amt] of Object.entries(categoryTotals)) {
			if (amt > topExpenseAmount) {
				topExpenseCategory = cat;
				topExpenseAmount = amt;
			}
		}

		// For now, set % change to 0 until we add previous period query
		setMetrics({
			totalIncome,
			totalExpenses,
			balance,
			savingsRate: Number(savingsRate),
			topExpenseCategory,
			topExpenseAmount,
			incomeChange: 0,
			expensesChange: 0,
		});
	};

	useEffect(() => {
		let isCurrent = true;

		const load = async () => {
			const result = await fetchMetrics();
			if (isCurrent && result) {
				setMetrics(result);
			}
		};
		load();

		return () => {
			isCurrent = false;
		};
	}, [timePeriod]);

	if (!metrics) return <div>Loading...</div>;

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{/* Income Metric */}
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div className="flex flex-col">
							<span className="text-sm font-medium text-muted-foreground">
								Total Income
							</span>
							<span className="text-2xl font-bold">
								${metrics.totalIncome.toLocaleString()}
							</span>
						</div>
						<div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
							<ArrowUpIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Expenses Metric */}
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div className="flex flex-col">
							<span className="text-sm font-medium text-muted-foreground">
								Total Expenses
							</span>
							<span className="text-2xl font-bold">
								${metrics.totalExpenses.toLocaleString()}
							</span>
						</div>
						<div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
							<ArrowDownIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Balance Metric */}
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div className="flex flex-col">
							<span className="text-sm font-medium text-muted-foreground">
								Net Balance
							</span>
							<span className="text-2xl font-bold">
								${metrics.balance.toLocaleString()}
							</span>
						</div>
						<div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
							<DollarSignIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Savings Rate Metric */}
			<Card>
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div className="flex flex-col">
							<span className="text-sm font-medium text-muted-foreground">
								Savings Rate
							</span>
							<span className="text-2xl font-bold">
								{metrics.savingsRate}%
							</span>
						</div>
						<div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
							<PiggyBankIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
						</div>
					</div>
					<div className="mt-4 text-xs font-medium text-muted-foreground">
						Top expense: {metrics.topExpenseCategory} ($
						{metrics.topExpenseAmount.toLocaleString()})
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

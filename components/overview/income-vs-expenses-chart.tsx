"use client";

import React, { useMemo } from "react";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import type { DashboardTransaction } from "@/hooks/use-dashboard-transactions";

interface ChartPoint {
	name: string;
	income: number;
	expenses: number;
	balance: number;
}

interface IncomeVsExpensesChartProps {
	timePeriod: string;
	transactions: DashboardTransaction[];
	loading?: boolean;
}

const getLabelsForPeriod = (timePeriod: string): string[] => {
	switch (timePeriod) {
		case "week":
			return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
		case "month":
			return ["Week 1", "Week 2", "Week 3", "Week 4"];
		case "quarter":
			return ["Month 1", "Month 2", "Month 3"];
		case "year":
			return [
				"Jan", "Feb", "Mar", "Apr", "May", "Jun",
				"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
			];
		default:
			return ["Week 1", "Week 2", "Week 3", "Week 4"];
	}
};

const getPeriodStart = (period: string): Date => {
	const now = new Date();
	const copy = new Date(now);

	switch (period) {
		case "week": {
			const day = now.getDay();
			const mondayOffset = day === 0 ? -6 : 1 - day;
			copy.setDate(now.getDate() + mondayOffset);
			break;
		}
		case "month":
			copy.setDate(1);
			break;
		case "quarter": {
			const currentMonth = now.getMonth();
			const quarterStartMonth = currentMonth - (currentMonth % 3);
			copy.setMonth(quarterStartMonth, 1);
			break;
		}
		case "year":
			copy.setMonth(0, 1);
			break;
		default:
			copy.setDate(1);
	}

	copy.setHours(0, 0, 0, 0);
	return copy;
};

const getWeekBucket = (date: Date, weekStart: Date): number => {
	const diffDays = Math.floor(
		(date.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
	);
	return Math.min(Math.max(diffDays, 0), 6);
};

const getMonthBucket = (date: Date): number => {
	const day = date.getDate();
	return Math.min(Math.floor((day - 1) / 7), 3);
};

const getQuarterBucket = (date: Date): number => date.getMonth() % 3;

const getYearBucket = (date: Date): number => date.getMonth();

const groupTransactions = (
	rows: DashboardTransaction[],
	labels: string[],
	period: string,
	startOfPeriod: Date
): ChartPoint[] => {
	const buckets = labels.map(() => ({
		income: 0,
		expenses: 0,
		balance: 0,
	}));

	const getBucketIndex = (date: Date): number => {
		switch (period) {
			case "week":
				return getWeekBucket(date, startOfPeriod);
			case "month":
				return getMonthBucket(date);
			case "quarter":
				return getQuarterBucket(date);
			case "year":
				return getYearBucket(date);
			default:
				return getMonthBucket(date);
		}
	};

	const periodStartMs = startOfPeriod.getTime();

	rows.forEach((t) => {
		const date = new Date(t.created_at);
		if (date.getTime() < periodStartMs) return;

		const index = getBucketIndex(date);
		if (!buckets[index]) return;

		if (t.type === "income") buckets[index].income += t.amount;
		if (t.type === "expense") buckets[index].expenses += t.amount;

		buckets[index].balance =
			buckets[index].income - buckets[index].expenses;
	});

	return labels.map((label, i) => ({
		name: label,
		income: buckets[i].income,
		expenses: buckets[i].expenses,
		balance: buckets[i].balance,
	}));
};

const CustomTooltip = ({
	active,
	payload,
	label,
}: {
	active?: boolean;
	payload?: Array<{ value?: number; dataKey?: string }>;
	label?: string;
}) => {
	if (active && payload && payload.length) {
		const income = payload[0]?.value ?? 0;
		const expenses = payload[1]?.value ?? 0;
		const balance = payload[2]?.value ?? 0;

		return (
			<div className="bg-background border rounded-md shadow-md p-2 text-sm">
				<p className="font-semibold mb-1">{label}</p>
				<p className="text-emerald-600 dark:text-emerald-400">
					Income: ${Number(income).toLocaleString()}
				</p>
				<p className="text-rose-600 dark:text-rose-400">
					Expenses: ${Number(expenses).toLocaleString()}
				</p>
				<p
					className={
						balance >= 0
							? "text-blue-600 dark:text-blue-400"
							: "text-red-600 dark:text-red-400"
					}
				>
					Balance: ${Number(balance).toLocaleString()}
				</p>
			</div>
		);
	}
	return null;
};

export function IncomeVsExpensesChart({
	timePeriod,
	transactions,
	loading = false,
}: IncomeVsExpensesChartProps) {
	const data = useMemo(() => {
		const labels = getLabelsForPeriod(timePeriod);
		const startOfPeriod = getPeriodStart(timePeriod);
		return groupTransactions(transactions, labels, timePeriod, startOfPeriod);
	}, [transactions, timePeriod]);

	if (loading) {
		return (
			<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
				Loading chart...
			</div>
		);
	}

	return (
		<ResponsiveContainer width="100%" height="100%">
			<AreaChart
				data={data}
				margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
			>
				<CartesianGrid strokeDasharray="3 3" />

				<XAxis dataKey="name" />
				<YAxis />

				<Tooltip content={<CustomTooltip />} />
				<Legend />

				<Area
					type="monotone"
					dataKey="income"
					stackId="1"
					stroke="#22c55e"
					fill="#22c55e"
					fillOpacity={0.6}
					name="Income"
				/>

				<Area
					type="monotone"
					dataKey="expenses"
					stackId="2"
					stroke="#ef4444"
					fill="#ef4444"
					fillOpacity={0.6}
					name="Expenses"
				/>

				<Area
					type="monotone"
					dataKey="balance"
					stackId="3"
					stroke="#3b82f6"
					fill="#3b82f6"
					fillOpacity={0.6}
					name="Balance"
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
}

"use client";

import React, { useMemo } from "react";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Cell,
} from "recharts";
import type { DashboardTransaction } from "@/hooks/use-dashboard-transactions";

export interface CategoryStat {
	id: string;
	name: string;
	icon: string | null;
	color: string;
	count: number;
	totalAmount: number;
	avgAmount: number;
}

interface MostUsedCategoriesChartProps {
	timePeriod: string;
	transactions: DashboardTransaction[];
	loading?: boolean;
}

const getPeriodStart = (period: string): Date => {
	const now = new Date();
	const copy = new Date(now);

	switch (period) {
		case "week":
			copy.setDate(now.getDate() - 7);
			break;
		case "month":
			copy.setMonth(now.getMonth() - 1);
			break;
		case "quarter":
			copy.setMonth(now.getMonth() - 3);
			break;
		case "year":
			copy.setFullYear(now.getFullYear() - 1);
			break;
		default:
			copy.setMonth(now.getMonth() - 1);
	}

	return copy;
};

const computeCategoryStats = (
	transactions: DashboardTransaction[],
	timePeriod: string
): CategoryStat[] => {
	const periodStart = getPeriodStart(timePeriod).getTime();
	const stats: Record<string, CategoryStat> = {};

	for (const row of transactions) {
		if (row.type !== "expense") continue;
		if (new Date(row.created_at).getTime() < periodStart) continue;

		const cat = row.categories;
		if (!cat) continue;

		if (!stats[cat.id]) {
			stats[cat.id] = {
				id: cat.id,
				name: cat.name,
				icon: cat.icon,
				color: cat.color,
				count: 0,
				totalAmount: 0,
				avgAmount: 0,
			};
		}

		stats[cat.id].count++;
		stats[cat.id].totalAmount += row.amount;
	}

	return Object.values(stats)
		.map((cat) => ({
			...cat,
			avgAmount:
				cat.count > 0 ? Math.round(cat.totalAmount / cat.count) : 0,
		}))
		.sort((a, b) => b.count - a.count)
		.slice(0, 6);
};

const CustomTooltip = ({
	active,
	payload,
}: {
	active?: boolean;
	payload?: Array<{ payload: CategoryStat }>;
}) => {
	if (active && payload && payload.length) {
		const row = payload[0].payload;

		return (
			<div className="bg-background border rounded-md shadow-md p-3 text-sm">
				<p className="font-medium mb-1">
					{row.name} {row.icon}
				</p>
				<p className="text-muted-foreground">
					Transactions: {row.count}
				</p>
				<p className="text-muted-foreground">
					Total: ${row.totalAmount.toLocaleString()}
				</p>
				<p className="text-muted-foreground">
					Avg: ${row.avgAmount.toLocaleString()}/transaction
				</p>
			</div>
		);
	}
	return null;
};

export function MostUsedCategoriesChart({
	timePeriod,
	transactions,
	loading = false,
}: MostUsedCategoriesChartProps) {
	const chartData = useMemo(
		() => computeCategoryStats(transactions, timePeriod),
		[transactions, timePeriod]
	);

	if (loading) {
		return (
			<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
				Loading chart...
			</div>
		);
	}

	return (
		<ResponsiveContainer width="100%" height="100%">
			<BarChart
				data={chartData}
				layout="vertical"
				margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
			>
				<CartesianGrid
					strokeDasharray="3 3"
					horizontal={true}
					vertical={false}
				/>
				<XAxis type="number" />
				<YAxis
					type="category"
					dataKey="name"
					width={120}
					tickFormatter={(value) => {
						const match = chartData.find((c) => c.name === value);
						return `${value} ${match?.icon ?? ""}`;
					}}
					tick={{ fontSize: 12 }}
				/>
				<Tooltip content={<CustomTooltip />} />

				<Bar dataKey="count" name="Transactions">
					{chartData.map((entry) => (
						<Cell key={entry.id} fill={entry.color} />
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
}

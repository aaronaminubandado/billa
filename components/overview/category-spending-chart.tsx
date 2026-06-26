"use client";

import React, { useMemo } from "react";
import {
	PieChart,
	Pie,
	BarChart,
	Bar,
	Cell,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import type { DashboardTransaction } from "@/hooks/use-dashboard-transactions";

interface SpendingCategory {
	id: string;
	name: string;
	icon: string | null;
	color: string;
	totalAmount: number;
}

interface CategorySpendingChartProps {
	type: "pie" | "bar";
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

const computeCategorySpending = (
	transactions: DashboardTransaction[],
	timePeriod: string
): SpendingCategory[] => {
	const periodStart = getPeriodStart(timePeriod).getTime();
	const stats: Record<string, SpendingCategory> = {};

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
				totalAmount: 0,
			};
		}

		stats[cat.id].totalAmount += row.amount;
	}

	return Object.values(stats).sort((a, b) => b.totalAmount - a.totalAmount);
};

const CustomTooltip = ({
	active,
	payload,
}: {
	active?: boolean;
	payload?: Array<{ payload: SpendingCategory }>;
}) => {
	if (active && payload && payload.length) {
		const row = payload[0].payload;

		return (
			<div className="bg-background border rounded-md shadow-md p-2 text-sm">
				<p className="font-semibold mb-1">
					{row.name} {row.icon}
				</p>
				<p className="text-muted-foreground">
					Total: ${row.totalAmount.toLocaleString()}
				</p>
			</div>
		);
	}
	return null;
};

export function CategorySpendingChart({
	type,
	timePeriod,
	transactions,
	loading = false,
}: CategorySpendingChartProps) {
	const data = useMemo(
		() => computeCategorySpending(transactions, timePeriod),
		[transactions, timePeriod]
	);

	if (loading) {
		return (
			<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
				Loading chart...
			</div>
		);
	}

	if (type === "pie") {
		return (
			<ResponsiveContainer width="100%" height="100%">
				<PieChart>
					<Pie
						data={data}
						cx="50%"
						cy="50%"
						outerRadius={80}
						dataKey="totalAmount"
						nameKey="name"
						label={({ name, percent = 0 }) =>
							`${name} ${(percent * 100).toFixed(0)}%`
						}
					>
						{data.map((entry) => (
							<Cell key={entry.id} fill={entry.color} />
						))}
					</Pie>

					<Tooltip content={<CustomTooltip />} />
					<Legend />
				</PieChart>
			</ResponsiveContainer>
		);
	}

	return (
		<ResponsiveContainer width="100%" height="100%">
			<BarChart
				data={data}
				layout="vertical"
				margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
			>
				<CartesianGrid
					strokeDasharray="3 3"
					horizontal
					vertical={false}
				/>

				<XAxis type="number" />
				<YAxis
					type="category"
					dataKey="name"
					width={120}
					tickFormatter={(value) => {
						const match = data.find((c) => c.name === value);
						return `${value} ${match?.icon ?? ""}`;
					}}
				/>

				<Tooltip content={<CustomTooltip />} />

				<Bar dataKey="totalAmount" name="Total Spent">
					{data.map((entry) => (
						<Cell key={entry.id} fill={entry.color} />
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
}

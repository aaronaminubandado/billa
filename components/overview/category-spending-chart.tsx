"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
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

// TYPES
interface Category {
	id: string;
	name: string;
	color: string;
	icon: string | null;
}

interface TransactionRow {
	category_id: string | null;
	amount: number;
	type: "income" | "expense";
	created_at: string;
	categories: Category | null;
}

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
}

// FETCH FROM SUPABASE
const fetchSpendingRows = async (
	supabase: ReturnType<typeof createClient>,
	periodStart: string,
	userId: string
): Promise<TransactionRow[]> => {
	const { data, error } = await supabase
		.from("transactions")
		.select(
			`
      category_id,
      amount,
      type,
      created_at,
      categories ( id, name, color, icon )
    `
		)
		.gte("created_at", periodStart)
		.eq("type", "expense")
		.eq("user_id", userId);

	if (error) {
		console.error("Failed to fetch spending data:");
		return [];
	}

	return (data ?? []).map((row: any) => ({
		...row,
		categories: row.categories ?? null,
	})) as TransactionRow[];
};

// AGGREGATE TOTAL SPENDING PER CATEGORY
const computeCategorySpending = (
	rows: TransactionRow[]
): SpendingCategory[] => {
	const stats: Record<string, SpendingCategory> = {};

	for (const row of rows) {
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

// TIME PERIOD HANDLER
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

// TOOLTIP
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
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

// MAIN COMPONENT
export function CategorySpendingChart({
	type,
	timePeriod,
}: CategorySpendingChartProps) {
	const supabase = createClient();
	const [data, setData] = useState<SpendingCategory[]>([]);

	useEffect(() => {
		let cancelled = false;
		const load = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user || cancelled) return;

			const periodStart = getPeriodStart(timePeriod).toISOString();
			const rows = await fetchSpendingRows(
				supabase,
				periodStart,
				user.id
			);
			if (cancelled) return;
			const stats = computeCategorySpending(rows);

			setData(stats);
		};

		load();
		return () => {
			cancelled = true;
		};
	}, [timePeriod, supabase]);

	// PIE CHART
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

	// BAR CHART
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

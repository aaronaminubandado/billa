"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
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

export interface CategoryStat {
	id: string;
	name: string;
	icon: string | null;
	color: string;
	count: number;
	totalAmount: number;
	avgAmount: number;
}

// FETCH TRANSACTIONS + CATEGORIES
const fetchCategoryStats = async (
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

	if (error) throw error;

	return (data ?? []).map((row: any) => ({
		...row,
		categories: row.categories ?? null,
	})) as TransactionRow[];
};

// COMPUTE AGGREGATED CATEGORY STATS
const computeCategoryStats = (rows: TransactionRow[]): CategoryStat[] => {
	const stats: Record<string, CategoryStat> = {};

	for (const row of rows) {
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

		if (row.type === "expense") {
			stats[cat.id].totalAmount += row.amount;
		}
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

// TIME RANGE HANDLER
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

const CustomTooltip = ({
	active,
	payload,
}: {
	active?: boolean;
	payload?: any[];
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

// MAIN COMPONENT
interface MostUsedCategoriesChartProps {
	timePeriod: string;
}

const supabase = createClient();

export function MostUsedCategoriesChart({
	timePeriod,
}: MostUsedCategoriesChartProps) {
	const [chartData, setChartData] = useState<CategoryStat[]>([]);

	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user || cancelled) return;

				const periodStart = getPeriodStart(timePeriod).toISOString();
				const rows = await fetchCategoryStats(
					supabase,
					periodStart,
					user.id
				);
				if (cancelled) return;

				const stats = computeCategoryStats(rows);
				setChartData(stats);
			} catch (error) {
				console.error("Failed to load category stats:", error);
			}
		};

		load();

		return () => {
			cancelled = true;
		};
	}, [timePeriod]);

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

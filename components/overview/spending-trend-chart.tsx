"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";

// -------------------------------
// Types
// -------------------------------
interface Category {
	id: string;
	name: string;
	color: string;
	icon: string | null;
}

interface TransactionRow {
	amount: number;
	type: "expense" | "income";
	created_at: string;
	categories: Category | null;
}

interface SpendingPoint {
	name: string;
	[key: string]: number | string;
}

// -------------------------------
// Buckets
// -------------------------------
function normalize(d: Date) {
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function getBuckets(timePeriod: string) {
	const now = new Date();
	const buckets: { label: string; start: Date; end: Date }[] = [];

	if (timePeriod === "week") {
		for (let i = 6; i >= 0; i--) {
			const day = new Date(now);
			day.setDate(now.getDate() - i);
			const start = normalize(day);
			const end = new Date(start);
			end.setHours(23, 59, 59, 999);

			buckets.push({
				label: day.toLocaleDateString("en-US", { weekday: "short" }),
				start,
				end,
			});
		}
	}

	if (timePeriod === "month") {
		const year = now.getFullYear();
		const month = now.getMonth();

		for (let w = 0; w < 4; w++) {
			const start = new Date(year, month, w * 7 + 1);
			const end = new Date(year, month, w * 7 + 7, 23, 59, 59, 999);
			buckets.push({ label: `Week ${w + 1}`, start, end });
		}
	}

	if (timePeriod === "quarter") {
		const year = now.getFullYear();
		const currentMonth = now.getMonth();
		const quarterStartMonth = currentMonth - (currentMonth % 3);

		for (let i = 0; i < 3; i++) {
			const m = quarterStartMonth + i;
			const start = new Date(year, m, 1);
			const end = new Date(year, m + 1, 0, 23, 59, 59, 999);
			buckets.push({
				label: start.toLocaleString("en-US", { month: "short" }),
				start,
				end,
			});
		}
	}

	if (timePeriod === "year") {
		const year = now.getFullYear();
		for (let m = 0; m < 12; m++) {
			const start = new Date(year, m, 1);
			const end = new Date(year, m + 1, 0, 23, 59, 59, 999);
			buckets.push({
				label: start.toLocaleString("en-US", { month: "short" }),
				start,
				end,
			});
		}
	}

	return buckets;
}

// -------------------------------
// Supabase fetch
// -------------------------------
async function fetchTransactions(
	supabase: ReturnType<typeof createClient>,
	userId: string,
	after: Date
): Promise<TransactionRow[]> {
	const { data, error } = await supabase
		.from("transactions")
		.select(
			`
      amount,
      type,
      created_at,
      categories ( id, name, color, icon )
    `
		)
		.gte("created_at", after.toISOString())
		.eq("user_id", userId);

	if (error) throw error;

	return data.map((row: any) => ({
		...row,
		categories: row.categories ?? null,
	}));
}

// -------------------------------
// Component
// -------------------------------
interface SpendingTrendChartProps {
	timePeriod: string;
}

export function SpendingTrendChart({ timePeriod }: SpendingTrendChartProps) {
	const supabase = createClient();
	const [chartType, setChartType] = useState<"expense" | "income">("expense");
	const [chartData, setChartData] = useState<SpendingPoint[]>([]);
	const [categoryList, setCategoryList] = useState<Category[]>([]);

	useEffect(() => {
		const load = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			const buckets = getBuckets(timePeriod);
			const earliest = buckets[0].start;

			const rows = await fetchTransactions(supabase, user.id, earliest);

			// Filter based on toggle (income/expense)
			const filteredRows = rows.filter((t) => t.type === chartType);

			// Discover categories dynamically
			const categoryMap: Record<string, Category> = {};
			filteredRows.forEach((r) => {
				if (r.categories) categoryMap[r.categories.id] = r.categories;
			});
			const categories = Object.values(categoryMap);
			setCategoryList(categories);

			// Base dataset
			const result: SpendingPoint[] = buckets.map((b) => {
				const point: SpendingPoint = { name: b.label };
				categories.forEach((c) => (point[c.name] = 0));
				point.Total = 0;
				return point;
			});

			// Fill dataset
			filteredRows.forEach((row) => {
				const cat = row.categories;
				if (!cat) return;

				const date = new Date(row.created_at);

				const bucketIndex = buckets.findIndex(
					(b) => date >= b.start && date <= b.end
				);

				if (bucketIndex >= 0) {
					result[bucketIndex][cat.name] =
						Number(result[bucketIndex][cat.name]) + row.amount;

					result[bucketIndex].Total =
						Number(result[bucketIndex].Total) + row.amount;
				}
			});

			setChartData(result);
		};

		load();
	}, [timePeriod, chartType]);

	return (
		<div className="flex flex-col gap-3 w-full h-full">
			{/* Toggle */}
			{/* <div className="flex gap-2 mb-2">
				<button
					onClick={() => setChartType("expense")}
					className={`px-3 py-1 rounded ${
						chartType === "expense"
							? "bg-blue-600 text-white"
							: "bg-gray-200"
					}`}
				>
					Expenses
				</button>

				<button
					onClick={() => setChartType("income")}
					className={`px-3 py-1 rounded ${
						chartType === "income"
							? "bg-blue-600 text-white"
							: "bg-gray-200"
					}`}
				>
					Income
				</button>
			</div> */}

			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={chartData}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="name" />
					<YAxis />
					<Tooltip />
					<Legend />

					<Line
						type="monotone"
						dataKey="Total"
						stroke="#64748b"
						strokeWidth={2}
					/>

					{categoryList.map((cat) => (
						<Line
							key={cat.id}
							type="monotone"
							dataKey={cat.name}
							stroke={cat.color}
							strokeWidth={2}
						/>
					))}
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}

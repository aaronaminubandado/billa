"use client";

import React, { useMemo } from "react";
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
import type { DashboardTransaction } from "@/hooks/use-dashboard-transactions";

interface Category {
	id: string;
	name: string;
	color: string;
	icon: string | null;
}

interface SpendingPoint {
	name: string;
	[key: string]: number | string;
}

interface SpendingTrendChartProps {
	timePeriod: string;
	transactions: DashboardTransaction[];
	loading?: boolean;
}

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
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const weeksInMonth = Math.ceil(daysInMonth / 7);

		for (let w = 0; w < weeksInMonth; w++) {
			const startDay = w * 7 + 1;
			const endDay = Math.min((w + 1) * 7, daysInMonth);
			const start = new Date(year, month, startDay);
			const end = new Date(year, month, endDay, 23, 59, 59, 999);
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

function buildChartData(
	transactions: DashboardTransaction[],
	timePeriod: string
): { chartData: SpendingPoint[]; categoryList: Category[] } {
	const chartType = "expense" as const;
	const buckets = getBuckets(timePeriod);
	if (buckets.length === 0) {
		return { chartData: [], categoryList: [] };
	}

	const earliest = buckets[0].start;
	const filteredRows = transactions.filter(
		(t) =>
			t.type === chartType &&
			new Date(t.created_at) >= earliest &&
			t.categories
	);

	const categoryMap: Record<string, Category> = {};
	filteredRows.forEach((r) => {
		if (r.categories) categoryMap[r.categories.id] = r.categories;
	});
	const categories = Object.values(categoryMap);

	const result: SpendingPoint[] = buckets.map((b) => {
		const point: SpendingPoint = { name: b.label };
		categories.forEach((c) => (point[c.name] = 0));
		point.Total = 0;
		return point;
	});

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

	return { chartData: result, categoryList: categories };
}

export function SpendingTrendChart({
	timePeriod,
	transactions,
	loading = false,
}: SpendingTrendChartProps) {
	const { chartData, categoryList } = useMemo(
		() => buildChartData(transactions, timePeriod),
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
		<div className="flex flex-col gap-3 w-full h-full">
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

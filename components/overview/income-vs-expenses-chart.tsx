"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
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


interface Transaction {
	id: string;
	amount: number;
	type: "income" | "expense";
	created_at: string;
}

interface ChartPoint {
	name: string; 
	income: number;
	expenses: number;
	balance: number;
}

interface IncomeVsExpensesChartProps {
	timePeriod: string;
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
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec",
			];

		default:
			return ["Week 1", "Week 2", "Week 3", "Week 4"];
	}
};


// START DATE BASED ON PERIOD
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


// GROUP TRANSACTIONS BY PERIOD BUCKET
const groupTransactions = (
	rows: Transaction[],
	labels: string[],
	period: string
): ChartPoint[] => {
	const buckets = labels.map(() => ({
		income: 0,
		expenses: 0,
		balance: 0,
	}));

	const getBucketIndex = (date: Date): number => {
		switch (period) {
			case "week":
				return date.getDay() === 0 ? 6 : date.getDay() - 1; // Make Monday index 0

			case "month": {
				const day = date.getDate();
				return Math.min(3, Math.floor((day - 1) / 7));
			}

			case "quarter":
				return date.getMonth() % 3;

			case "year":
				return date.getMonth();

			default:
				return 0;
		}
	};

	rows.forEach((t) => {
		const date = new Date(t.created_at);
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

// =============================
// CUSTOM TOOLTIP
// =============================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
	if (active && payload?.length) {
		const income = payload[0]?.value ?? 0;
		const expenses = payload[1]?.value ?? 0;
		const balance = payload[2]?.value ?? 0;

		return (
			<div className="bg-background border rounded-md shadow-md p-3 text-sm">
				<p className="font-medium mb-1">{label}</p>

				<p className="text-green-600 dark:text-green-400">
					Income: ${income.toLocaleString()}
				</p>

				<p className="text-red-600 dark:text-red-400">
					Expenses: ${expenses.toLocaleString()}
				</p>

				<p
					className={
						balance >= 0
							? "text-blue-600 dark:text-blue-400"
							: "text-red-600 dark:text-red-400"
					}
				>
					Balance: ${balance.toLocaleString()}
				</p>
			</div>
		);
	}
	return null;
};


// MAIN COMPONENT
export function IncomeVsExpensesChart({
	timePeriod,
}: IncomeVsExpensesChartProps) {
	const supabase = createClient();
	const [data, setData] = useState<ChartPoint[]>([]);

	useEffect(() => {
		const load = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) return;

			const periodStart = getPeriodStart(timePeriod).toISOString();

			const { data: rows, error } = await supabase
				.from("transactions")
				.select("id, amount, type, created_at")
				.gte("created_at", periodStart)
				.eq("user_id", user.id);

			if (error) {
				console.error("Error fetching:", error);
				return;
			}

			const labels = getLabelsForPeriod(timePeriod);
			const grouped = groupTransactions(rows ?? [], labels, timePeriod);

			setData(grouped);
		};

		load();
	}, [timePeriod]);

	
	// RENDER CHART
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

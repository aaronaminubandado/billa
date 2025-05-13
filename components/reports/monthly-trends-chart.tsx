
"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Generate sample monthly data
const generateMonthlyData = (months: number) => {
  const data = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();

    // Base values with some randomness
    const baseIncome = 2000 + Math.random() * 500;
    const baseExpenses = 1500 + Math.random() * 400;

    // Add seasonal variations
    const seasonalFactor =
      1 + 0.2 * Math.sin((date.getMonth() / 12) * 2 * Math.PI);

    // Add trend (slight increase over time)
    const trendFactor = 1 + (i / months) * 0.1;

    const income = Math.round((baseIncome * seasonalFactor) / trendFactor);
    const expenses = Math.round((baseExpenses * seasonalFactor) / trendFactor);
    const savings = income - expenses;

    data.push({
      month: `${monthName} ${year}`,
      income,
      expenses,
      savings,
    });
  }

  return data;
};

// Custom tooltip
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-md p-3 text-sm">
        <p className="font-medium mb-1">{label}</p>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {entry.name}: ${entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface MonthlyTrendsChartProps {
  timeRange: string;
}

export function MonthlyTrendsChart({ timeRange }: MonthlyTrendsChartProps) {
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [chartType, setChartType] = useState<"line" | "area">("line");

  useEffect(() => {
    // Determine number of months based on timeRange
    let months = 6;

    switch (timeRange) {
      case "3months":
        months = 3;
        break;
      case "6months":
        months = 6;
        break;
      case "1year":
        months = 12;
        break;
      case "ytd":
        months = new Date().getMonth() + 1; // Current month + 1
        break;
      case "all":
        months = 24; // Show 2 years for "all time" in this demo
        break;
      default:
        months = 6;
    }

    setData(generateMonthlyData(months));
  }, [timeRange]);

  return (
    <div className="h-full">
      <Tabs
        defaultValue="line"
        className="w-full h-full"
        onValueChange={(value) => setChartType(value as "line" | "area")}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="line">Line Chart</TabsTrigger>
          <TabsTrigger value="area">Area Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="line" className="h-[calc(100%-40px)]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.split(" ")[0]} // Show only month abbreviation
              />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#22c55e"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#ef4444"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="savings"
                name="Savings"
                stroke="#3b82f6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="area" className="h-[calc(100%-40px)]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.split(" ")[0]} // Show only month abbreviation
              />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stackId="1"
                stroke="#22c55e"
                fill="#22c55e"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stackId="2"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="savings"
                name="Savings"
                stackId="3"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
}

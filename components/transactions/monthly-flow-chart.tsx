// New chart component for monthly cash flow
"use client";

import React from "react";
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
import { useTheme } from "next-themes";

// Sample data
const data = [
  { month: "Jan", income: 4000, expenses: 2400, net: 1600 },
  { month: "Feb", income: 3000, expenses: 1398, net: 1602 },
  { month: "Mar", income: 2000, expenses: 9800, net: -7800 },
  { month: "Apr", income: 2780, expenses: 3908, net: -1128 },
  { month: "May", income: 1890, expenses: 4800, net: -2910 },
  { month: "Jun", income: 2390, expenses: 3800, net: -1410 },
  { month: "Jul", income: 3490, expenses: 4300, net: -810 },
  { month: "Aug", income: 4000, expenses: 2400, net: 1600 },
  { month: "Sep", income: 3000, expenses: 1398, net: 1602 },
  { month: "Oct", income: 2000, expenses: 1800, net: 200 },
  { month: "Nov", income: 2780, expenses: 3908, net: -1128 },
  { month: "Dec", income: 3890, expenses: 4800, net: -910 },
];

export function MonthlyFlowChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Adjust colors based on theme
  const colors = {
    income: isDark ? "#4ade80" : "#22c55e",
    expenses: isDark ? "#f87171" : "#ef4444",
    net: isDark ? "#60a5fa" : "#3b82f6",
    grid: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    text: isDark ? "#e5e7eb" : "#374151",
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis dataKey="month" stroke={colors.text} />
        <YAxis stroke={colors.text} />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            borderColor: isDark ? "#374151" : "#e5e7eb",
            color: colors.text,
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="income"
          stroke={colors.income}
          activeDot={{ r: 8 }}
          name="Income"
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke={colors.expenses}
          name="Expenses"
        />
        <Line
          type="monotone"
          dataKey="net"
          stroke={colors.net}
          name="Net Flow"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// New chart component for top spending categories
"use client";

import React from "react";
import {
  BarChart,
  Bar,
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
  { name: "Food", amount: 1200 },
  { name: "Housing", amount: 2000 },
  { name: "Transport", amount: 800 },
  { name: "Entertainment", amount: 500 },
  { name: "Utilities", amount: 400 },
];

export function TopCategoriesChart() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Adjust colors based on theme
  const colors = {
    bar: isDark ? "#f87171" : "#ef4444",
    grid: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    text: isDark ? "#e5e7eb" : "#374151",
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
        <XAxis type="number" stroke={colors.text} />
        <YAxis
          dataKey="name"
          type="category"
          stroke={colors.text}
          width={100}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            borderColor: isDark ? "#374151" : "#e5e7eb",
            color: colors.text,
          }}
          formatter={(value) => [`$${value}`, "Amount"]}
        />
        <Legend />
        <Bar
          dataKey="amount"
          fill={colors.bar}
          name="Spending"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

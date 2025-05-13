"use client";

import React from "react";
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

// Sample categories with colors
const categories = [
  { id: 1, name: "Housing", color: "#22c55e", icon: "🏠" },
  { id: 2, name: "Food", color: "#f97316", icon: "🍔" },
  { id: 3, name: "Transportation", color: "#3b82f6", icon: "🚗" },
  { id: 4, name: "Entertainment", color: "#a855f7", icon: "🎬" },
  { id: 5, name: "Shopping", color: "#ec4899", icon: "🛒" },
  { id: 6, name: "Utilities", color: "#64748b", icon: "💡" },
  { id: 7, name: "Healthcare", color: "#ef4444", icon: "🏥" },
  { id: 8, name: "Education", color: "#eab308", icon: "🎓" },
];

// Generate sample spending data
const generateSpendingData = (timePeriod: string) => {
  // In a real app, this would fetch data based on the time period
  const multiplier =
    timePeriod === "week"
      ? 0.25
      : timePeriod === "month"
      ? 1
      : timePeriod === "quarter"
      ? 3
      : timePeriod === "year"
      ? 12
      : 1;

  return categories
    .map((category) => {
      // Generate a somewhat realistic amount based on category
      let baseAmount = 0;
      switch (category.name) {
        case "Housing":
          baseAmount = 1200;
          break;
        case "Food":
          baseAmount = 500;
          break;
        case "Transportation":
          baseAmount = 300;
          break;
        case "Entertainment":
          baseAmount = 200;
          break;
        case "Shopping":
          baseAmount = 250;
          break;
        case "Utilities":
          baseAmount = 150;
          break;
        case "Healthcare":
          baseAmount = 100;
          break;
        case "Education":
          baseAmount = 80;
          break;
        default:
          baseAmount = 100;
      }

      // Add some randomness
      const randomFactor = 0.8 + Math.random() * 0.4; // Between 0.8 and 1.2
      const amount = Math.round(baseAmount * multiplier * randomFactor);

      return {
        name: category.name,
        value: amount,
        color: category.color,
        icon: category.icon,
      };
    })
    .sort((a, b) => b.value - a.value); // Sort by value descending
};

// Custom tooltip for charts
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-md p-2 text-sm">
        <p className="font-medium">{`${payload[0].name} ${payload[0].payload.icon}`}</p>
        <p className="text-muted-foreground">{`Amount: $${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

interface CategorySpendingChartProps {
  type: "pie" | "bar";
  timePeriod: string;
}

export function CategorySpendingChart({
  type,
  timePeriod,
}: CategorySpendingChartProps) {
  const data = generateSpendingData(timePeriod);

  if (type === "pie") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
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
        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
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
          tick={{ fontSize: 12 }}
          width={80}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" name={"name"}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

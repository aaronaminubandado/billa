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
  Cell,
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

// Generate sample most used categories data
const generateMostUsedCategoriesData = (timePeriod: string) => {
  // In a real app, this would fetch data based on the time period

  // Generate random transaction counts for each category
  const data = categories
    .map((category) => {
      // Base transaction count
      let baseCount = 0;
      switch (category.name) {
        case "Food":
          baseCount = 25;
          break;
        case "Transportation":
          baseCount = 18;
          break;
        case "Shopping":
          baseCount = 12;
          break;
        case "Entertainment":
          baseCount = 8;
          break;
        case "Utilities":
          baseCount = 5;
          break;
        case "Housing":
          baseCount = 3;
          break;
        case "Healthcare":
          baseCount = 2;
          break;
        case "Education":
          baseCount = 1;
          break;
        default:
          baseCount = 5;
      }

      // Adjust based on time period
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

      // Add some randomness
      const randomFactor = 0.8 + Math.random() * 0.4; // Between 0.8 and 1.2
      const count = Math.round(baseCount * multiplier * randomFactor);

      // Calculate average amount per transaction
      let avgAmount = 0;
      switch (category.name) {
        case "Housing":
          avgAmount = 1200 / 3; // Assuming 3 transactions per month
          break;
        case "Food":
          avgAmount = 500 / 25; // Assuming 25 transactions per month
          break;
        case "Transportation":
          avgAmount = 300 / 18;
          break;
        case "Entertainment":
          avgAmount = 200 / 8;
          break;
        case "Shopping":
          avgAmount = 250 / 12;
          break;
        case "Utilities":
          avgAmount = 150 / 5;
          break;
        case "Healthcare":
          avgAmount = 100 / 2;
          break;
        case "Education":
          avgAmount = 80 / 1;
          break;
        default:
          avgAmount = 20;
      }

      return {
        name: category.name,
        count: count,
        totalAmount: Math.round(count * avgAmount),
        avgAmount: Math.round(avgAmount),
        color: category.color,
        icon: category.icon,
      };
    })
    .sort((a, b) => b.count - a.count); // Sort by count descending

  // Take top 6 categories
  return data.slice(0, 6);
};

// Custom tooltip for the chart
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-md p-3 text-sm">
        <p className="font-medium mb-1">{`${payload[0].payload.name} ${payload[0].payload.icon}`}</p>
        <p className="text-muted-foreground">
          Transactions: {payload[0].value}
        </p>
        <p className="text-muted-foreground">
          Total: ${payload[0].payload.totalAmount.toLocaleString()}
        </p>
        <p className="text-muted-foreground">
          Avg: ${payload[0].payload.avgAmount.toLocaleString()}/transaction
        </p>
      </div>
    );
  }
  return null;
};

interface MostUsedCategoriesChartProps {
  timePeriod: string;
}

export function MostUsedCategoriesChart({
  timePeriod,
}: MostUsedCategoriesChartProps) {
  const data = generateMostUsedCategoriesData(timePeriod);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
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
          tick={{ fontSize: 12 }}
          width={100}
          tickFormatter={(value) =>
            `${value} ${data.find((item) => item.name === value)?.icon || ""}`
          }
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="count" name="Number of Transactions">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

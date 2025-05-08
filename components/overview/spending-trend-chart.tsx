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

// Sample categories with colors
const categories = [
  { id: 1, name: "Housing", color: "#22c55e" },
  { id: 2, name: "Food", color: "#f97316" },
  { id: 3, name: "Transportation", color: "#3b82f6" },
  { id: 4, name: "Entertainment", color: "#a855f7" },
];

// sample spending trend data
const generateSpendingTrendData = (timePeriod: string) => {
  // In a real app, this would fetch data based on the time period
  let dataPoints = [];
  let labels = [];

  switch (timePeriod) {
    case "week":
      labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      break;
    case "month":
      labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
      break;
    case "quarter":
      labels = ["Jan", "Feb", "Mar"];
      break;
    case "year":
      labels = [
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
      break;
    default:
      labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
  }

  // Base values for each category
  const baseValues = {
    Housing: 1200,
    Food: 500,
    Transportation: 300,
    Entertainment: 200,
  };

  // Generate data points
  dataPoints = labels.map((label) => {
    const dataPoint: any = { name: label };

    // Add data for each category with some randomness
    categories.forEach((category) => {
      const baseValue = baseValues[category.name as keyof typeof baseValues];
      const randomFactor = 0.8 + Math.random() * 0.4; // Between 0.8 and 1.2
      dataPoint[category.name] = Math.round(baseValue * randomFactor);
    });

    // Add total
    dataPoint.Total = Object.keys(dataPoint)
      .filter((key) => key !== "name")
      .reduce((sum, key) => sum + dataPoint[key], 0);

    return dataPoint;
  });

  return dataPoints;
};

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-md p-3 text-sm">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p
            key={`item-${index}`}
            style={{ color: entry.color }}
            className="flex justify-between"
          >
            <span>{entry.name}: </span>
            <span className="font-medium ml-2">
              ${entry.value.toLocaleString()}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface SpendingTrendChartProps {
  timePeriod: string;
}

export function SpendingTrendChart({ timePeriod }: SpendingTrendChartProps) {
  const data = generateSpendingTrendData(timePeriod);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="Total"
          stroke="#64748b"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
        {categories.map((category) => (
          <Line
            key={category.id}
            type="monotone"
            dataKey={category.name}
            stroke={category.color}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

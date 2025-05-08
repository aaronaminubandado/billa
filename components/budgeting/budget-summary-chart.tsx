"use client";

import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Custom tooltip for charts
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-md shadow-md p-2 text-sm">
        <p className="font-medium">{`${payload[0].name} ${payload[0].payload.icon}`}</p>
        <p className="text-muted-foreground">{`Budgeted: $${payload[0].payload.budgeted.toLocaleString()}`}</p>
        <p className="text-muted-foreground">{`Used: $${payload[0].payload.used.toLocaleString()}`}</p>
        <p className="text-muted-foreground">{`Remaining: $${(
          payload[0].payload.budgeted - payload[0].payload.used
        ).toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

interface BudgetSummaryChartProps {
  budgetData: any[];
}

export function BudgetSummaryChart({ budgetData }: BudgetSummaryChartProps) {
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");

  // Process data for charts
  const chartData = budgetData.map((group) => {
    const totalBudgeted = group.budgets.reduce(
      (sum: number, budget: any) => sum + budget.amount,
      0
    );
    const totalUsed = group.budgets.reduce(
      (sum: number, budget: any) => sum + budget.used,
      0
    );

    return {
      name: group.category.name,
      icon: group.category.icon,
      color: group.category.color,
      budgeted: totalBudgeted,
      used: totalUsed,
      remaining: totalBudgeted - totalUsed,
    };
  });

  return (
    <div className="h-full">
      <Tabs
        defaultValue="pie"
        className="w-full h-full"
        onValueChange={(value) => setChartType(value as "pie" | "bar")}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="pie">Pie Chart</TabsTrigger>
          <TabsTrigger value="bar">Bar Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="pie" className="h-[calc(100%-40px)]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="budgeted"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </TabsContent>

        <TabsContent value="bar" className="h-[calc(100%-40px)]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="budgeted" name="Budgeted" fill="#64748b">
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-budgeted-${index}`}
                    fill={entry.color}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
              <Bar dataKey="used" name="Used" fill="#64748b">
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-used-${index}`}
                    fill={entry.color}
                    fillOpacity={0.5}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </TabsContent>
      </Tabs>
    </div>
  );
}

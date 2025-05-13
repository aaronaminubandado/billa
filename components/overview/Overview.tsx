"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SettingsIcon,
} from "lucide-react";
import { CategorySpendingChart } from "@/components/overview/category-spending-chart";
import { IncomeVsExpensesChart } from "@/components/overview/income-vs-expenses-chart";
import { SpendingTrendChart } from "@/components/overview/spending-trend-chart";
import { MostUsedCategoriesChart } from "@/components/overview/most-used-categories-chart";
import { DashboardMetrics } from "@/components/overview/dashboard-metrics";

export default function Overview() {
  // State for chart visibility toggles
  const [visibleCharts, setVisibleCharts] = useState({
    categorySpending: true,
    incomeVsExpenses: true,
    spendingTrend: true,
    mostUsedCategories: true,
  });

  // State for time period filter
  const [timePeriod, setTimePeriod] = useState("month");

  // Toggle chart visibility
  const toggleChart = (chartName: keyof typeof visibleCharts) => {
    setVisibleCharts((prev) => ({
      ...prev,
      [chartName]: !prev[chartName],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <SettingsIcon className="h-4 w-4" />
            <span className="sr-only">Dashboard settings</span>
          </Button>
        </div>
      </div>

      {/* Dashboard Metrics */}
      <DashboardMetrics timePeriod={timePeriod} />

      {/* Chart visibility toggles */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Dashboard Widgets</CardTitle>
          <CardDescription>
            Toggle widgets to customize your dashboard view
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="category-spending"
                checked={visibleCharts.categorySpending}
                onCheckedChange={() => toggleChart("categorySpending")}
              />
              <Label htmlFor="category-spending">Category Spending</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="income-vs-expenses"
                checked={visibleCharts.incomeVsExpenses}
                onCheckedChange={() => toggleChart("incomeVsExpenses")}
              />
              <Label htmlFor="income-vs-expenses">Income vs Expenses</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="spending-trend"
                checked={visibleCharts.spendingTrend}
                onCheckedChange={() => toggleChart("spendingTrend")}
              />
              <Label htmlFor="spending-trend">Spending Trend</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="most-used-categories"
                checked={visibleCharts.mostUsedCategories}
                onCheckedChange={() => toggleChart("mostUsedCategories")}
              />
              <Label htmlFor="most-used-categories">Most Used Categories</Label>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            {/* TODO comment for drag-and-drop functionality */}
            {/* // TODO: Implement drag-and-drop functionality to reorder dashboard widgets */}
            Drag and drop functionality for reordering widgets coming soon.
          </p>
        </CardContent>
      </Card>

      {/* Charts grid with conditional rendering based on visibility toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {visibleCharts.categorySpending && (
          <Card className="col-span-1 md:col-span-1">
            <CardHeader>
              <CardTitle>Monthly Spending by Category</CardTitle>
              <CardDescription>
                Breakdown of your expenses across different categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pie" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="pie">Pie Chart</TabsTrigger>
                  <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                </TabsList>
                <TabsContent value="pie" className="h-[300px]">
                  <CategorySpendingChart type="pie" timePeriod={timePeriod} />
                </TabsContent>
                <TabsContent value="bar" className="h-[300px]">
                  <CategorySpendingChart type="bar" timePeriod={timePeriod} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {visibleCharts.incomeVsExpenses && (
          <Card className="col-span-1 md:col-span-1">
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
              <CardDescription>
                Comparison of your income and expenses over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <IncomeVsExpensesChart timePeriod={timePeriod} />
              </div>
            </CardContent>
          </Card>
        )}

        {visibleCharts.spendingTrend && (
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Spending Trend</CardTitle>
              <CardDescription>
                Track how your spending has changed over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <SpendingTrendChart timePeriod={timePeriod} />
              </div>
            </CardContent>
          </Card>
        )}

        {visibleCharts.mostUsedCategories && (
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Most Used Categories</CardTitle>
              <CardDescription>
                Your most frequently used spending categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <MostUsedCategoriesChart timePeriod={timePeriod} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

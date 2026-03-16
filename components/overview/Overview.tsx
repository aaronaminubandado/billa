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
  SlidersHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { CategorySpendingChart } from "@/components/overview/category-spending-chart";
import { IncomeVsExpensesChart } from "@/components/overview/income-vs-expenses-chart";
import { SpendingTrendChart } from "@/components/overview/spending-trend-chart";
import { MostUsedCategoriesChart } from "@/components/overview/most-used-categories-chart";
import { DashboardMetrics } from "@/components/overview/dashboard-metrics";

export default function Overview() {
  const [visibleCharts, setVisibleCharts] = useState({
    categorySpending: true,
    incomeVsExpenses: true,
    spendingTrend: true,
    mostUsedCategories: true,
  });

  const [timePeriod, setTimePeriod] = useState("month");
  const [showWidgetSettings, setShowWidgetSettings] = useState(false);

  const toggleChart = (chartName: keyof typeof visibleCharts) => {
    setVisibleCharts((prev) => ({
      ...prev,
      [chartName]: !prev[chartName],
    }));
  };

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto min-w-0">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-full min-w-0 sm:w-[160px] h-9 text-sm">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2"
            onClick={() => setShowWidgetSettings(!showWidgetSettings)}
          >
            <SlidersHorizontalIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Widgets</span>
            {showWidgetSettings ? (
              <ChevronUpIcon className="h-3 w-3" />
            ) : (
              <ChevronDownIcon className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>

      <DashboardMetrics timePeriod={timePeriod} />

      {showWidgetSettings && (
        <Card className="animate-slide-up">
          <CardContent className="py-4 px-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: "categorySpending" as const, label: "Category Spending" },
                { id: "incomeVsExpenses" as const, label: "Income vs Expenses" },
                { id: "spendingTrend" as const, label: "Spending Trend" },
                { id: "mostUsedCategories" as const, label: "Top Categories" },
              ].map((widget) => (
                <div key={widget.id} className="flex items-center space-x-2">
                  <Switch
                    id={widget.id}
                    checked={visibleCharts[widget.id]}
                    onCheckedChange={() => toggleChart(widget.id)}
                  />
                  <Label htmlFor={widget.id} className="text-xs font-medium cursor-pointer">
                    {widget.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleCharts.categorySpending && (
          <Card className="animate-slide-up overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Spending by Category</CardTitle>
              <CardDescription className="text-xs">
                Breakdown of expenses across categories
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Tabs defaultValue="pie" className="w-full">
                <TabsList className="h-8 mb-3">
                  <TabsTrigger value="pie" className="text-xs px-3 h-6">Pie</TabsTrigger>
                  <TabsTrigger value="bar" className="text-xs px-3 h-6">Bar</TabsTrigger>
                </TabsList>
                <TabsContent value="pie" className="h-[280px]">
                  <CategorySpendingChart type="pie" timePeriod={timePeriod} />
                </TabsContent>
                <TabsContent value="bar" className="h-[280px]">
                  <CategorySpendingChart type="bar" timePeriod={timePeriod} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {visibleCharts.incomeVsExpenses && (
          <Card className="animate-slide-up overflow-hidden" style={{ animationDelay: "100ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Income vs Expenses</CardTitle>
              <CardDescription className="text-xs">
                Income and expense comparison over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[320px]">
                <IncomeVsExpensesChart timePeriod={timePeriod} />
              </div>
            </CardContent>
          </Card>
        )}

        {visibleCharts.spendingTrend && (
          <Card className="lg:col-span-2 animate-slide-up overflow-hidden" style={{ animationDelay: "200ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Spending Trend</CardTitle>
              <CardDescription className="text-xs">
                Track how your spending changes over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-[300px]">
                <SpendingTrendChart timePeriod={timePeriod} />
              </div>
            </CardContent>
          </Card>
        )}

        {visibleCharts.mostUsedCategories && (
          <Card className="lg:col-span-2 animate-slide-up overflow-hidden" style={{ animationDelay: "300ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Most Used Categories</CardTitle>
              <CardDescription className="text-xs">
                Your most frequently used spending categories
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
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

"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  DollarSignIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  PiggyBankIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Sample data for metrics
const getMetricsData = (timePeriod: string) => {
  // In a real app, this would fetch data based on the time period
  const baseData = {
    totalIncome: 4850,
    totalExpenses: 3275,
    balance: 1575,
    savingsRate: 32.5,
    incomeChange: 5.2,
    expensesChange: -2.8,
    topExpenseCategory: "Housing",
    topExpenseAmount: 1200,
  };

  // Adjust data based on time period for demo purposes
  switch (timePeriod) {
    case "week":
      return {
        ...baseData,
        totalIncome: 1200,
        totalExpenses: 850,
        balance: 350,
        savingsRate: 29.2,
      };
    case "month":
      return baseData;
    case "quarter":
      return {
        ...baseData,
        totalIncome: 14500,
        totalExpenses: 9800,
        balance: 4700,
        savingsRate: 32.4,
      };
    case "year":
      return {
        ...baseData,
        totalIncome: 58200,
        totalExpenses: 39300,
        balance: 18900,
        savingsRate: 32.5,
      };
    default:
      return baseData;
  }
};

interface DashboardMetricsProps {
  timePeriod: string;
}

export function DashboardMetrics({ timePeriod }: DashboardMetricsProps) {
  const metrics = getMetricsData(timePeriod);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Income Metric */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">
                Total Income
              </span>
              <span className="text-2xl font-bold">
                ${metrics.totalIncome.toLocaleString()}
              </span>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <ArrowUpIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span
              className={cn(
                "text-xs font-medium",
                metrics.incomeChange >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {metrics.incomeChange >= 0 ? (
                <TrendingUpIcon className="inline h-3 w-3 mr-1" />
              ) : (
                <TrendingDownIcon className="inline h-3 w-3 mr-1" />
              )}
              {Math.abs(metrics.incomeChange)}% from previous period
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Metric */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">
                Total Expenses
              </span>
              <span className="text-2xl font-bold">
                ${metrics.totalExpenses.toLocaleString()}
              </span>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <ArrowDownIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span
              className={cn(
                "text-xs font-medium",
                metrics.expensesChange <= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {metrics.expensesChange <= 0 ? (
                <TrendingDownIcon className="inline h-3 w-3 mr-1" />
              ) : (
                <TrendingUpIcon className="inline h-3 w-3 mr-1" />
              )}
              {Math.abs(metrics.expensesChange)}% from previous period
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Balance Metric */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">
                Net Balance
              </span>
              <span className="text-2xl font-bold">
                ${metrics.balance.toLocaleString()}
              </span>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <DollarSignIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs font-medium text-muted-foreground">
              {metrics.balance >= 0 ? "Surplus" : "Deficit"} for this period
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Savings Rate Metric */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-muted-foreground">
                Savings Rate
              </span>
              <span className="text-2xl font-bold">{metrics.savingsRate}%</span>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <PiggyBankIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-xs font-medium text-muted-foreground">
              Top expense: {metrics.topExpenseCategory} ($
              {metrics.topExpenseAmount})
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

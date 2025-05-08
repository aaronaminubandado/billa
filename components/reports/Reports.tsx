"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterIcon } from "lucide-react";
import { MonthlyTrendsChart } from "@/components/reports/monthly-trends-chart";
import { SavingsGoalProgress } from "@/components/reports/savings-goal-progress";
import { SpendingByWallet } from "@/components/reports/spending-by-wallet";
import { TopExpenses } from "@/components/reports/top-expenses";
import { ExportButtons } from "@/components/reports/export-buttons";

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("6months");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

        <ExportButtons />
      </div>

      {/* Time range and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="w-full sm:w-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="sm" className="w-full sm:w-auto">
          <FilterIcon className="h-4 w-4 mr-2" />
          Advanced Filters
        </Button>
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Income</CardDescription>
            <CardTitle className="text-2xl">$12,580.45</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 dark:text-green-400">
                ↑ 12.5%
              </span>{" "}
              from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Expenses</CardDescription>
            <CardTitle className="text-2xl">$9,432.18</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 dark:text-red-400">↑ 8.2%</span>{" "}
              from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Net Savings</CardDescription>
            <CardTitle className="text-2xl">$3,148.27</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 dark:text-green-400">
                ↑ 24.8%
              </span>{" "}
              from previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Savings Rate</CardDescription>
            <CardTitle className="text-2xl">25.0%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 dark:text-green-400">↑ 3.2%</span>{" "}
              from previous period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly trends chart */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Monthly Income & Expenses</CardTitle>
          <CardDescription>
            Track your monthly income and expenses over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <MonthlyTrendsChart timeRange={timeRange} />
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different report types */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="savings">Savings Goals</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Savings Goal Progress</CardTitle>
                <CardDescription>
                  Track your progress towards your savings goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <SavingsGoalProgress />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 5 Expenses</CardTitle>
                <CardDescription>
                  Your biggest expenses in the past month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <TopExpenses />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Spending by Wallet</CardTitle>
              <CardDescription>
                See how your spending is distributed across your accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <SpendingByWallet />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="savings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Savings Goal Progress</CardTitle>
              <CardDescription>
                Detailed view of your progress towards savings goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <SavingsGoalProgress detailed={true} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Wallet</CardTitle>
              <CardDescription>
                Detailed breakdown of spending across your accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <SpendingByWallet detailed={true} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of your expenses by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <TopExpenses detailed={true} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

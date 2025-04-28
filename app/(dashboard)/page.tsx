"use client";
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  SettingsIcon,
  BarChartIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  PiggyBankIcon,
  LineChartIcon,
} from "lucide-react";
import Overview from "@/components/overview/Overview";
import Expenses from "@/components/expenses.tsx/Expenses";
import Income from "@/components/income/Income";
import Budgeting from "@/components/budgeting/Budgeting";
import Reports from "@/components/reports/Reports";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-green-500">Billa</h1>
        </div>
        <Button variant="outline">
          <SettingsIcon className="mr-2 h-4 w-4" /> Settings
        </Button>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">
            <BarChartIcon className="mr-2 h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <ArrowDownIcon className="mr-2 h-4 w-4" /> Expenses
          </TabsTrigger>
          <TabsTrigger value="income">
            <ArrowUpIcon className="mr-2 h-4 w-4" /> Income
          </TabsTrigger>
          <TabsTrigger value="budgeting">
            <PiggyBankIcon className="mr-2 h-4 w-4" /> Budgeting
          </TabsTrigger>
          <TabsTrigger value="reports">
            <LineChartIcon className="mr-2 h-4 w-4" /> Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Overview />
        </TabsContent>

        <TabsContent value="expenses">
          <Expenses />
        </TabsContent>

        <TabsContent value="income">
          <Income />
        </TabsContent>

        <TabsContent value="budgeting">
          <Budgeting />
        </TabsContent>

        <TabsContent value="reports">
          <Reports />
        </TabsContent>
      </Tabs>
    </div>
  );
}

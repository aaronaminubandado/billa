"use client";
import React from "react";
import Budgeting from "@/components/budgeting/Budgeting";

export default function BudgetingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Budgeting</h1>
        <p className="text-sm text-muted-foreground">Set and manage your spending budgets</p>
      </div>

      <Budgeting />
    </div>
  );
}

"use client";
import React from "react";
import Budgeting from "@/components/budgeting/Budgeting";

export default function BudgetingPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Budgeting</h1>
        <p className="text-muted-foreground">Set and manage your budgets</p>
      </div>
      
      <Budgeting />
    </div>
  );
}
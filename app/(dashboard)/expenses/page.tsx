"use client";
import React from "react";
import Expenses from "@/components/expenses.tsx/Expenses";

export default function ExpensesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <p className="text-muted-foreground">Track and manage your expenses</p>
      </div>
      
      <Expenses />
    </div>
  );
}
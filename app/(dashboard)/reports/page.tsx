"use client";
import React from "react";
import Reports from "@/components/reports/Reports";

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">View detailed financial reports and analytics</p>
      </div>
      
      <Reports />
    </div>
  );
}
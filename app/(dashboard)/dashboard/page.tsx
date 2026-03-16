"use client";
import React from "react";
import Overview from "@/components/overview/Overview";

export default function DashboardPage() {
  return (
    <div className="space-y-1">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your financial overview at a glance
        </p>
      </div>

      <Overview />
    </div>
  );
}

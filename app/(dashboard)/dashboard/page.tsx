"use client";
import React from "react";
import Overview from "@/components/overview/Overview";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Overview</h1>
        <p className="text-muted-foreground">Your financial summary at a glance</p>
      </div>
      
      <Overview />
    </div>
  );
}
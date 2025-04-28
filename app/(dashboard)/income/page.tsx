"use client";
import React from "react";
import Income from "@/components/income/Income";

export default function IncomePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Income</h1>
        <p className="text-muted-foreground">Track and manage your income sources</p>
      </div>
      
      <Income />
    </div>
  );
}
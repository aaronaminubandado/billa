"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetCategoryGroupProps {
  category: {
    id: number;
    name: string;
    icon: string;
    color: string;
  };
  budgets: Array<{
    id: number;
    name: string;
    amount: number;
    used: number;
    period: string;
  }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEditBudget: (budget: any) => void;
}

export function BudgetCategoryGroup({
  category,
  budgets,
  onEditBudget,
}: BudgetCategoryGroupProps) {
  // Calculate total budgeted and used amounts for this category
  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalUsed = budgets.reduce((sum, budget) => sum + budget.used, 0);

  // Format period label
  const formatPeriod = (period: string) => {
    switch (period) {
      case "weekly":
        return "/week";
      case "monthly":
        return "/month";
      case "quarterly":
        return "/quarter";
      case "yearly":
        return "/year";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center">
          <div
            className="w-8 h-8 rounded-full mr-2 flex items-center justify-center text-lg"
            style={{ backgroundColor: category.color, color: "white" }}
          >
            {category.icon}
          </div>
          <span>{category.name}</span>
          <span className="ml-auto text-sm font-normal text-muted-foreground">
            ${totalUsed.toLocaleString()} / ${totalBudgeted.toLocaleString()}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgets.map((budget) => {
            // Calculate percentage used
            const percentUsed =
              budget.amount > 0 ? (budget.used / budget.amount) * 100 : 0;

            // Determine progress bar color based on percentage used
            const progressColor =
              percentUsed > 100
                ? "bg-red-600"
                : percentUsed > 90
                ? "bg-yellow-500"
                : "bg-green-600";

            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{budget.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -mr-2"
                        onClick={() => onEditBudget(budget)}
                      >
                        <EditIcon className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit {budget.name}</span>
                      </Button>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        ${budget.used.toLocaleString()} of $
                        {budget.amount.toLocaleString()}
                        <span className="text-xs ml-1">
                          {formatPeriod(budget.period)}
                        </span>
                      </span>
                      <span
                        className={cn(
                          percentUsed > 100
                            ? "text-red-600 dark:text-red-400"
                            : percentUsed > 90
                            ? "text-yellow-500 dark:text-yellow-400"
                            : "text-green-600 dark:text-green-400"
                        )}
                      >
                        {Math.round(percentUsed)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${progressColor}`}
                    style={{ width: `${Math.min(100, percentUsed)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

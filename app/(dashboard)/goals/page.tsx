// Savings and Debt Goals management page
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  PlusIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddGoalModal } from "@/components/goals/add-goal-modal";
import { EditGoalModal } from "@/components/goals/edit-goal-modal";
import { cn } from "@/lib/utils";

// Sample goals data
const sampleGoals = [
  {
    id: 1,
    name: "Emergency Fund",
    targetAmount: 10000,
    currentAmount: 5500,
    dueDate: "2023-12-31",
    category: "Savings",
    type: "savings",
    icon: "🛡️",
    color: "#22c55e",
  },
  {
    id: 2,
    name: "New Car",
    targetAmount: 25000,
    currentAmount: 8000,
    dueDate: "2024-06-30",
    category: "Savings",
    type: "savings",
    icon: "🚗",
    color: "#3b82f6",
  },
  {
    id: 3,
    name: "Vacation Fund",
    targetAmount: 3000,
    currentAmount: 1200,
    dueDate: "2023-08-15",
    category: "Savings",
    type: "savings",
    icon: "✈️",
    color: "#f97316",
  },
  {
    id: 4,
    name: "Credit Card Debt",
    targetAmount: 5000,
    currentAmount: 2000,
    dueDate: "2023-10-15",
    category: "Debt",
    type: "debt",
    icon: "💳",
    color: "#ef4444",
  },
  {
    id: 5,
    name: "Student Loan",
    targetAmount: 15000,
    currentAmount: 4500,
    dueDate: "2025-05-20",
    category: "Debt",
    type: "debt",
    icon: "🎓",
    color: "#a855f7",
  },
];

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Helper function to calculate days remaining
const getDaysRemaining = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Helper function to determine goal status
const getGoalStatus = (
  currentAmount: number,
  targetAmount: number,
  dueDate: string
) => {
  const percentComplete = (currentAmount / targetAmount) * 100;
  const daysRemaining = getDaysRemaining(dueDate);

  if (daysRemaining < 0) {
    return { label: "Overdue", color: "destructive" };
  }

  if (percentComplete >= 100) {
    return { label: "Completed", color: "success" };
  }

  // Calculate expected progress based on time
  const startDate = new Date("2023-01-01"); // Assuming all goals started at the beginning of the year
  const dueDateObj = new Date(dueDate);
  const today = new Date();

  const totalDays =
    (dueDateObj.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  const elapsedDays =
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

  const expectedProgress = (elapsedDays / totalDays) * 100;

  if (percentComplete >= expectedProgress - 10) {
    return { label: "On Track", color: "success" };
  } else if (percentComplete >= expectedProgress - 25) {
    return { label: "Slightly Behind", color: "warning" };
  } else {
    return { label: "Behind", color: "destructive" };
  }
};

export default function GoalsPage() {
  const [goals, setGoals] = useState(sampleGoals);
  const [activeTab, setActiveTab] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<any>(null);

  // Filter goals based on active tab
  const filteredGoals = goals.filter((goal) => {
    if (activeTab === "all") return true;
    return goal.type === activeTab;
  });

  // Handle goal deletion
  const handleDeleteGoal = (id: number) => {
    // TODO: Implement actual deletion with Supabase
    setGoals(goals.filter((goal) => goal.id !== id));
  };

  // Handle edit button click
  const handleEditClick = (goal: any) => {
    setCurrentGoal(goal);
    setIsEditModalOpen(true);
  };

  // Handle goal update
  const handleUpdateGoal = (updatedGoal: any) => {
    // TODO: Implement actual update with Supabase
    setGoals(
      goals.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal))
    );
    setIsEditModalOpen(false);
  };

  // Handle adding a new goal
  const handleAddGoal = (newGoal: any) => {
    // TODO: Implement actual creation with Supabase
    const id = Math.max(...goals.map((g) => g.id)) + 1;
    setGoals([...goals, { ...newGoal, id }]);
    setIsAddModalOpen(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Savings & Debt Goals</h1>
        <p className="text-muted-foreground">
          Track your financial goals and progress
        </p>
      </div>

      {/* Tabs and action button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full sm:w-auto"
        >
          <TabsList>
            <TabsTrigger value="all">All Goals</TabsTrigger>
            <TabsTrigger value="savings">Savings</TabsTrigger>
            <TabsTrigger value="debt">Debt</TabsTrigger>
          </TabsList>
        </Tabs>

        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {/* Goals grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGoals.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">No goals found</p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Your First Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredGoals.map((goal) => {
            const percentComplete = Math.min(
              100,
              (goal.currentAmount / goal.targetAmount) * 100
            );
            const status = getGoalStatus(
              goal.currentAmount,
              goal.targetAmount,
              goal.dueDate
            );
            const daysRemaining = getDaysRemaining(goal.dueDate);

            return (
              <Card key={goal.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{goal.icon}</span>
                      <div>
                        <CardTitle>{goal.name}</CardTitle>
                        <Badge
                          variant={
                            goal.type === "savings" ? "outline" : "secondary"
                          }
                          className="mt-1"
                        >
                          {goal.type.charAt(0).toUpperCase() +
                            goal.type.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontalIcon className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(goal)}>
                          <PencilIcon className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-red-600 dark:text-red-400"
                        >
                          <TrashIcon className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm text-muted-foreground">
                      Progress
                    </div>
                    <div className="text-sm font-medium">
                      {percentComplete.toFixed(0)}%
                    </div>
                  </div>
                  <Progress
                    value={percentComplete}
                    className="h-2"
                    style={
                      {
                        "--progress-background": goal.color,
                      } as React.CSSProperties
                    }
                  />

                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Current
                      </span>
                      <span className="text-sm font-medium">
                        {formatCurrency(goal.currentAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Target
                      </span>
                      <span className="text-sm font-medium">
                        {formatCurrency(goal.targetAmount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {daysRemaining > 0
                      ? `${daysRemaining} days left`
                      : "Due date passed"}
                  </div>
                  <Badge variant={status.color as any}>{status.label}</Badge>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddGoal}
      />

      {/* Edit Goal Modal */}
      {currentGoal && (
        <EditGoalModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          goal={currentGoal}
          onUpdate={handleUpdateGoal}
        />
      )}
    </div>
  );
}

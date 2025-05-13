"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon, FilterIcon } from "lucide-react";
import { AddBudgetModal } from "@/components/budgeting/add-budget-modal";
import { EditBudgetModal } from "@/components/budgeting/edit-budget-modal";
import { BudgetCategoryGroup } from "@/components/budgeting/budget-category-group";
import { BudgetSummaryChart } from "@/components/budgeting/budget-summary-chart";

// Interfaces 
interface Budget {
  id: number;
  name: string;
  amount: number;
  used: number;
  period: string;
}

interface BudgetCategory {
  id: number;
  name: string;
  icon: string;
  color: string;
}

interface BudgetData {
  category: BudgetCategory;
  budgets: Budget[];
}

// New interfaces for input types
interface NewBudgetInput {
  categoryId: number;
  name: string;
  amount: number;
  period: string;
}

interface EditBudgetInput {
  id: number;
  name: string;
  amount: number;
  period: string;
}

interface BudgetWithCategory extends Budget {
  category: BudgetCategory;
}

// Sample budget data grouped by category
const sampleBudgetData: BudgetData[] = [
  {
    category: {
      id: 1,
      name: "Housing",
      icon: "🏠",
      color: "#22c55e",
    },
    budgets: [
      { id: 1, name: "Rent", amount: 1200, used: 1200, period: "monthly" },
      { id: 2, name: "Utilities", amount: 200, used: 180, period: "monthly" },
      { id: 3, name: "Internet", amount: 80, used: 80, period: "monthly" },
    ],
  },
  {
    category: {
      id: 2,
      name: "Food",
      icon: "🍔",
      color: "#f97316",
    },
    budgets: [
      { id: 4, name: "Groceries", amount: 400, used: 350, period: "monthly" },
      { id: 5, name: "Dining Out", amount: 200, used: 250, period: "monthly" },
    ],
  },
  {
    category: {
      id: 3,
      name: "Transportation",
      icon: "🚗",
      color: "#3b82f6",
    },
    budgets: [
      { id: 6, name: "Gas", amount: 150, used: 120, period: "monthly" },
      {
        id: 7,
        name: "Public Transit",
        amount: 100,
        used: 80,
        period: "monthly",
      },
      {
        id: 8,
        name: "Car Maintenance",
        amount: 100,
        used: 0,
        period: "monthly",
      },
    ],
  },
  {
    category: {
      id: 4,
      name: "Entertainment",
      icon: "🎬",
      color: "#a855f7",
    },
    budgets: [
      {
        id: 9,
        name: "Streaming Services",
        amount: 50,
        used: 50,
        period: "monthly",
      },
      {
        id: 10,
        name: "Movies & Events",
        amount: 100,
        used: 75,
        period: "monthly",
      },
    ],
  },
  {
    category: {
      id: 5,
      name: "Shopping",
      icon: "🛒",
      color: "#ec4899",
    },
    budgets: [
      { id: 11, name: "Clothing", amount: 150, used: 200, period: "monthly" },
      { id: 12, name: "Electronics", amount: 100, used: 0, period: "monthly" },
    ],
  },
];

export default function BudgetPage() {
  // State for modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<BudgetWithCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [budgetData, setBudgetData] = useState<BudgetData[]>(sampleBudgetData);

  // Handle adding a new budget
  const handleAddBudget = (newBudget: NewBudgetInput) => {
    // In a real app, this would make an API call
    console.log("Adding new budget:", newBudget);

    // Find the category group
    const categoryIndex = budgetData.findIndex(
      (group) => group.category.id === newBudget.categoryId
    );

    if (categoryIndex >= 0) {
      // Add to existing category
      const updatedData = [...budgetData];
      updatedData[categoryIndex].budgets.push({
        id:
          Math.max(
            ...budgetData.flatMap((group) => group.budgets.map((b) => b.id)),
            0 // Fallback if no budgets exist
          ) + 1,
        name: newBudget.name,
        amount: newBudget.amount,
        used: 0,
        period: newBudget.period,
      });
      setBudgetData(updatedData);
    } else {
      // This would handle adding a new category group if needed
      // For this demo, we'll just log it
      console.log("Category not found");
    }

    setIsAddModalOpen(false);
  };

  // Handle editing a budget
  const handleEditBudget = (updatedBudget: EditBudgetInput) => {
    // In a real app, this would make an API call
    console.log("Updating budget:", updatedBudget);

    const updatedData = budgetData.map((group) => {
      const updatedBudgets = group.budgets.map((budget) =>
        budget.id === updatedBudget.id
          ? { ...budget, ...updatedBudget }
          : budget
      );

      return {
        ...group,
        budgets: updatedBudgets,
      };
    });

    setBudgetData(updatedData);
    setIsEditModalOpen(false);
  };

  // Handle deleting a budget
  const handleDeleteBudget = (budgetId: number) => {
    // In a real app, this would make an API call
    console.log("Deleting budget:", budgetId);

    const updatedData = budgetData
      .map((group) => ({
        ...group,
        budgets: group.budgets.filter((budget) => budget.id !== budgetId),
      }))
      .filter((group) => group.budgets.length > 0);

    setBudgetData(updatedData);
    setIsEditModalOpen(false);
  };

  // Open edit modal with selected budget
  const openEditModal = (budget: Budget, category: BudgetCategory) => {
    setCurrentBudget({ ...budget, category });
    setIsEditModalOpen(true);
  };

  // Filter budgets based on search query
  const filteredBudgetData =
    searchQuery.trim() === ""
      ? budgetData
      : budgetData
          .map((group) => ({
            ...group,
            budgets: group.budgets.filter((budget) =>
              budget.name.toLowerCase().includes(searchQuery.toLowerCase())
            ),
          }))
          .filter((group) => group.budgets.length > 0);

  // Calculate total budgeted and used amounts
  const totalBudgeted = budgetData.reduce(
    (total, group) =>
      total + group.budgets.reduce((sum, budget) => sum + budget.amount, 0),
    0
  );

  const totalUsed = budgetData.reduce(
    (total, group) =>
      total + group.budgets.reduce((sum, budget) => sum + budget.used, 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Budget
        </Button>
      </div>

      {/* Budget summary section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Budget Summary</CardTitle>
            <CardDescription>
              Overview of your budget allocation and usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <BudgetSummaryChart budgetData={budgetData} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Status</CardTitle>
            <CardDescription>Your overall budget progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Budgeted</span>
                  <span className="font-medium">
                    ${totalBudgeted.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Used</span>
                  <span className="font-medium">
                    ${totalUsed.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span
                    className={`font-medium ${
                      totalBudgeted - totalUsed >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    ${(totalBudgeted - totalUsed).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Overall Progress
                  </span>
                  <span className="font-medium">
                    {Math.round((totalUsed / totalBudgeted) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      totalUsed / totalBudgeted > 1
                        ? "bg-red-600"
                        : totalUsed / totalBudgeted > 0.9
                        ? "bg-yellow-500"
                        : "bg-green-600"
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (totalUsed / totalBudgeted) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and filter section */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search budgets..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <FilterIcon className="h-4 w-4" />
          <span className="sr-only">Filter</span>
        </Button>
      </div>

      {/* Budget categories section */}
      <div className="space-y-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Budgets</TabsTrigger>
            <TabsTrigger value="ontrack">On Track</TabsTrigger>
            <TabsTrigger value="warning">Warning</TabsTrigger>
            <TabsTrigger value="over">Over Budget</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {filteredBudgetData.length > 0 ? (
              filteredBudgetData.map((group) => (
                <BudgetCategoryGroup
                  key={group.category.id}
                  category={group.category}
                  budgets={group.budgets}
                  onEditBudget={(budget) =>
                    openEditModal(budget, group.category)
                  }
                />
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No budgets found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ontrack" className="space-y-6">
            {filteredBudgetData
              .map((group) => {
                const onTrackBudgets = group.budgets.filter(
                  (budget) => budget.used / budget.amount <= 0.9
                );

                if (onTrackBudgets.length === 0) return null;

                return (
                  <BudgetCategoryGroup
                    key={group.category.id}
                    category={group.category}
                    budgets={onTrackBudgets}
                    onEditBudget={(budget) =>
                      openEditModal(budget, group.category)
                    }
                  />
                );
              })
              .filter(Boolean)}
          </TabsContent>

          <TabsContent value="warning" className="space-y-6">
            {filteredBudgetData
              .map((group) => {
                const warningBudgets = group.budgets.filter(
                  (budget) =>
                    budget.used / budget.amount > 0.9 &&
                    budget.used / budget.amount <= 1
                );

                if (warningBudgets.length === 0) return null;

                return (
                  <BudgetCategoryGroup
                    key={group.category.id}
                    category={group.category}
                    budgets={warningBudgets}
                    onEditBudget={(budget) =>
                      openEditModal(budget, group.category)
                    }
                  />
                );
              })
              .filter(Boolean)}
          </TabsContent>

          <TabsContent value="over" className="space-y-6">
            {filteredBudgetData
              .map((group) => {
                const overBudgets = group.budgets.filter(
                  (budget) => budget.used / budget.amount > 1
                );

                if (overBudgets.length === 0) return null;

                return (
                  <BudgetCategoryGroup
                    key={group.category.id}
                    category={group.category}
                    budgets={overBudgets}
                    onEditBudget={(budget) =>
                      openEditModal(budget, group.category)
                    }
                  />
                );
              })
              .filter(Boolean)}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <AddBudgetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddBudget}
        categories={budgetData.map((group) => group.category)}
      />

      {currentBudget && (
        <EditBudgetModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          budget={currentBudget}
          onUpdate={handleEditBudget}
          onDelete={handleDeleteBudget}
          categories={budgetData.map((group) => group.category)}
        />
      )}
    </div>
  );
}

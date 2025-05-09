// Categories management page
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  PlusIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { AddCategoryModal } from "@/components/categories/add-category-modal";
import { EditCategoryModal } from "@/components/categories/edit-category-modal";
import { cn } from "@/lib/utils";

// Sample category data
const sampleCategories = [
  {
    id: 1,
    name: "Groceries",
    type: "expense",
    color: "#22c55e",
    icon: "🛒",
    transactionCount: 24,
  },
  {
    id: 2,
    name: "Dining Out",
    type: "expense",
    color: "#f97316",
    icon: "🍔",
    transactionCount: 18,
  },
  {
    id: 3,
    name: "Transportation",
    type: "expense",
    color: "#3b82f6",
    icon: "🚗",
    transactionCount: 12,
  },
  {
    id: 4,
    name: "Entertainment",
    type: "expense",
    color: "#a855f7",
    icon: "🎬",
    transactionCount: 8,
  },
  {
    id: 5,
    name: "Utilities",
    type: "expense",
    color: "#64748b",
    icon: "💡",
    transactionCount: 6,
  },
  {
    id: 6,
    name: "Salary",
    type: "income",
    color: "#22c55e",
    icon: "💰",
    transactionCount: 3,
  },
  {
    id: 7,
    name: "Freelance",
    type: "income",
    color: "#3b82f6",
    icon: "💻",
    transactionCount: 5,
  },
  {
    id: 8,
    name: "Investments",
    type: "income",
    color: "#f97316",
    icon: "📈",
    transactionCount: 2,
  },
  {
    id: 9,
    name: "Gifts",
    type: "income",
    color: "#ec4899",
    icon: "🎁",
    transactionCount: 1,
  },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(sampleCategories);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [typeFilter, setTypeFilter] = useState("all");

  // Filter categories based on type
  const filteredCategories = categories.filter((category) => {
    return typeFilter === "all" || category.type === typeFilter;
  });

  // Handle category deletion
  const handleDeleteCategory = (id: number) => {
    // TODO: Implement actual deletion with Supabase
    setCategories(categories.filter((category) => category.id !== id));
  };

  // Handle edit button click
  const handleEditClick = (category: any) => {
    setCurrentCategory(category);
    setIsEditModalOpen(true);
  };

  // Handle category update
  const handleUpdateCategory = (updatedCategory: any) => {
    // TODO: Implement actual update with Supabase
    setCategories(
      categories.map((category) =>
        category.id === updatedCategory.id ? updatedCategory : category
      )
    );
    setIsEditModalOpen(false);
  };

  // Handle adding a new category
  const handleAddCategory = (newCategory: any) => {
    // TODO: Implement actual creation with Supabase
    const id = Math.max(...categories.map((c) => c.id)) + 1;
    setCategories([...categories, { ...newCategory, id, transactionCount: 0 }]);
    setIsAddModalOpen(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-muted-foreground">
          Manage your transaction categories
        </p>
      </div>

      {/* Filter and action controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="expense">Expenses</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Categories table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Your Categories</CardTitle>
          <CardDescription>
            Organize your transactions with custom categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Color</TableHead>
                <TableHead className="text-right">Transactions</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium text-xl">
                      {category.icon}
                    </TableCell>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          category.type === "income" ? "default" : "destructive"
                        }
                      >
                        {category.type.charAt(0).toUpperCase() +
                          category.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {category.transactionCount}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontalIcon className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleEditClick(category)}
                          >
                            <PencilIcon className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCategory}
      />

      {/* Edit Category Modal */}
      {currentCategory && (
        <EditCategoryModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          category={currentCategory}
          onUpdate={handleUpdateCategory}
        />
      )}
    </div>
  );
}

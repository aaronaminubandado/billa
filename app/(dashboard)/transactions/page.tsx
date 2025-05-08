//  New unified transactions page replacing separate expense/income pages
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PlusIcon,
  FilterIcon,
  ArrowUpDownIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { AddTransactionModal } from "@/components/transactions/add-transaction-modal";
import { MonthlyFlowChart } from "@/components/transactions/monthly-flow-chart";
import { TopCategoriesChart } from "@/components/transactions/top-categories-chart";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

// Sample transaction data
const transactions = [
  {
    id: 1,
    date: "2023-06-15",
    description: "Grocery Shopping",
    category: "Food",
    wallet: "Cash",
    amount: -120.5,
    type: "expense",
  },
  {
    id: 2,
    date: "2023-06-14",
    description: "Salary",
    category: "Income",
    wallet: "Bank",
    amount: 3000,
    type: "income",
  },
  {
    id: 3,
    date: "2023-06-12",
    description: "Restaurant",
    category: "Food",
    wallet: "Credit Card",
    amount: -85.75,
    type: "expense",
  },
  {
    id: 4,
    date: "2023-06-10",
    description: "Freelance Work",
    category: "Income",
    wallet: "Bank",
    amount: 500,
    type: "income",
  },
  {
    id: 5,
    date: "2023-06-08",
    description: "Gas",
    category: "Transportation",
    wallet: "Credit Card",
    amount: -45.2,
    type: "expense",
  },
  {
    id: 6,
    date: "2023-06-05",
    description: "Movie Tickets",
    category: "Entertainment",
    wallet: "Cash",
    amount: -30,
    type: "expense",
  },
  {
    id: 7,
    date: "2023-06-01",
    description: "Rent",
    category: "Housing",
    wallet: "Bank",
    amount: -1200,
    type: "expense",
  },
];

export default function TransactionsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Filter transactions based on search query and filters
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || transaction.category === categoryFilter;
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;

    return matchesSearch && matchesCategory && matchesType;
  });

  // Get unique categories for filter dropdown
  const categories = Array.from(new Set(transactions.map((t) => t.category)));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">Manage your income and expenses</p>
      </div>

      {/*  Added charts section with responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Cash Flow</CardTitle>
            <CardDescription>Net income vs expenses over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <MonthlyFlowChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
            <CardDescription>Your 5 highest expense categories</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <TopCategoriesChart />
          </CardContent>
        </Card>
      </div>

      {/*  Enhanced filter controls with responsive layout */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-[300px]"
          />

          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/*  Responsive table with horizontal scroll on mobile */}
      <div className="rounded-md border overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                <div className="flex items-center">
                  Date
                  <ArrowUpDownIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  Description
                  <ArrowUpDownIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Wallet</TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end">
                  Amount
                  <ArrowUpDownIcon className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-medium">
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{transaction.wallet}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium",
                      transaction.amount > 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount.toFixed(2)}
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 dark:text-red-400">
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
      </div>

      {/* Transaction form moved to modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}

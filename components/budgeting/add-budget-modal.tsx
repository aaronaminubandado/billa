"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (budget: any) => void;
  categories: any[];
}

export function AddBudgetModal({
  isOpen,
  onClose,
  onAdd,
  categories,
}: AddBudgetModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [period, setPeriod] = useState("monthly");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!name.trim() || !amount || !categoryId) {
      // TODO: Add proper form validation and error messages
      alert("Please fill in all required fields");
      return;
    }

    // Create new budget object
    const newBudget = {
      name,
      amount: parseFloat(amount),
      categoryId: parseInt(categoryId),
      period,
    };

    onAdd(newBudget);

    // Reset form
    setName("");
    setAmount("");
    setCategoryId("");
    setPeriod("monthly");
  };

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle>Add Budget</DialogTitle>
        <DialogDescription>
          Create a new budget to track your spending
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Budget Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Groceries, Rent, Entertainment"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground">
                $
              </span>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                className="pl-7"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <div className="flex items-center">
                      <span className="mr-2">{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period">Budget Period</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger id="period">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add Budget</Button>
        </DialogFooter>
      </form>
    </ResponsiveDialog>
  );
}

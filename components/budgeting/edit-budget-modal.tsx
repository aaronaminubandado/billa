"use client";

import React, { useState, useEffect } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ResponsiveDialog } from "@/components/ui/responsive-dialog";
import { TrashIcon } from "lucide-react";
import { toast } from "sonner";

interface EditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: {
    id: number;
    amount: number;
    category: { id: number; name: string; icon: string; color: string };
    period: string;
    used: number;
  };
  onUpdate: (budget: { id: number; amount: number; categoryId: number; period: string }) => void;
  onDelete: (id: number) => void;
  categories: { id: number; name: string; icon: string; color: string }[];
}

export function EditBudgetModal({
  isOpen,
  onClose,
  budget,
  onUpdate,
  onDelete,
  categories,
}: EditBudgetModalProps) {
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Set initial values when budget changes
  useEffect(() => {
    if (budget) {
      setAmount(budget.amount.toString());
      setCategoryId(budget.category.id.toString());
      setPeriod(budget.period);
    }
  }, [budget]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    onUpdate({
      id: budget.id,
      amount: parseFloat(amount),
      categoryId: parseInt(categoryId),
      period,
    });
  };

  const handleDelete = () => {
    onDelete(budget.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <ResponsiveDialog open={isOpen} onOpenChange={onClose}>
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
          <DialogDescription>Update your budget details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="mr-auto"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Update Budget</Button>
          </DialogFooter>
        </form>
      </ResponsiveDialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this budget. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

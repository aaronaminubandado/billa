// Refactored Add Category Modal with improved mobile responsiveness
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Common emoji options for categories
const emojiOptions = [
  "🛒",
  "🍔",
  "🚗",
  "🏠",
  "💡",
  "📱",
  "💻",
  "🎬",
  "🎮",
  "👕",
  "💰",
  "💳",
  "📈",
  "🏦",
  "🎁",
  "💼",
  "🏥",
  "✈️",
  "🎓",
  "📚",
];

// Color options for categories
const colorOptions = [
  "#22c55e",
  "#f97316",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
  "#64748b",
  "#ef4444",
  "#eab308",
  "#06b6d4",
  "#14b8a6",
];

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (category: any) => void;
}

export function AddCategoryModal({
  isOpen,
  onClose,
  onAdd,
}: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [icon, setIcon] = useState("🛒");
  const [color, setColor] = useState("#22c55e");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!name.trim()) {
      // TODO: Add proper form validation and error messages
      alert("Please enter a category name");
      return;
    }

    // Create new category object
    const newCategory = {
      name,
      type,
      icon,
      color,
    };

    onAdd(newCategory);

    // Reset form
    setName("");
    setType("expense");
    setIcon("🛒");
    setColor("#22c55e");
  };

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle>Add Category</DialogTitle>
        <DialogDescription>
          Create a new category for organizing your transactions
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Groceries, Rent, Salary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <ScrollArea className="h-[180px] rounded-md border p-2">
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                {emojiOptions.map((emoji) => (
                  <Button
                    key={emoji}
                    type="button"
                    variant={icon === emoji ? "default" : "outline"}
                    className="h-10 w-10 p-0 text-lg"
                    onClick={() => setIcon(emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {colorOptions.map((colorOption) => (
                <Button
                  key={colorOption}
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-10 w-10 p-0 rounded-full",
                    color === colorOption && "ring-2 ring-offset-2 ring-ring"
                  )}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => setColor(colorOption)}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add Category</Button>
        </DialogFooter>
      </form>
    </ResponsiveDialog>
  );
}

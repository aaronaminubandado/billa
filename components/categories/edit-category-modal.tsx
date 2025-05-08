// Edit Category Modal Component
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
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
import { useMediaQuery } from "@/hooks/use-media-query";
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

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: any;
  onUpdate: (category: any) => void;
}

export function EditCategoryModal({
  isOpen,
  onClose,
  category,
  onUpdate,
}: EditCategoryModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [icon, setIcon] = useState("🛒");
  const [color, setColor] = useState("#22c55e");
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Set initial values when category changes
  useEffect(() => {
    if (category) {
      setName(category.name);
      setType(category.type);
      setIcon(category.icon);
      setColor(category.color);
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!name.trim()) {
      // TODO: Add proper form validation and error messages
      alert("Please enter a category name");
      return;
    }

    // Create updated category object
    const updatedCategory = {
      ...category,
      name,
      type,
      icon,
      color,
    };

    onUpdate(updatedCategory);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "sm:max-w-[500px]",
          isMobile ? "w-full h-[100dvh] rounded-none max-h-[100dvh]" : ""
        )}
      >
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>Update your category details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
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
              <div className="grid grid-cols-10 gap-2">
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
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-10 gap-2">
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
            <Button type="submit">Update Category</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

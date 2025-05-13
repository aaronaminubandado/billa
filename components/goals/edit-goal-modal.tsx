// Edit Goal Modal Component
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

// Goal type options
const goalTypes = [
  { value: "savings", label: "Savings Goal" },
  { value: "debt", label: "Debt Repayment" },
];

// Icon options for goals
const iconOptions = [
  "🛡️",
  "🚗",
  "🏠",
  "✈️",
  "💰",
  "🎓",
  "💻",
  "📱",
  "👶",
  "🏥",
  "💍",
  "🎁",
  "💳",
  "🏦",
  "📈",
  "🎯",
  "💪",
  "🎮",
  "🎸",
  "📚",
];

// Color options for goals
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

interface EditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  goal: any;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdate: (goal: any) => void;
}

export function EditGoalModal({
  isOpen,
  onClose,
  goal,
  onUpdate,
}: EditGoalModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("savings");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [icon, setIcon] = useState("🎯");
  const [color, setColor] = useState("#22c55e");
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Set initial values when goal changes
  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setType(goal.type);
      setTargetAmount(goal.targetAmount.toString());
      setCurrentAmount(goal.currentAmount.toString());
      setDueDate(goal.dueDate);
      setIcon(goal.icon);
      setColor(goal.color);
    }
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!name.trim()) {
      // TODO: Add proper form validation and error messages
      alert("Please enter a goal name");
      return;
    }

    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      alert("Please enter a valid target amount");
      return;
    }

    if (!dueDate) {
      alert("Please select a due date");
      return;
    }

    // Create updated goal object
    const updatedGoal = {
      ...goal,
      name,
      type,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      dueDate,
      icon,
      color,
      category: type === "savings" ? "Savings" : "Debt",
    };

    onUpdate(updatedGoal);
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
          <DialogTitle>Edit Goal</DialogTitle>
          <DialogDescription>
            Update your goal details and progress
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Goal Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Emergency Fund, New Car"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Goal Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {goalTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount</Label>
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentAmount">Current Progress</Label>
              <Input
                id="currentAmount"
                type="number"
                step="0.01"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                How much {"you've"} already saved or paid off
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Target Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-10 gap-2">
                {iconOptions.map((iconOption) => (
                  <Button
                    key={iconOption}
                    type="button"
                    variant={icon === iconOption ? "default" : "outline"}
                    className="h-10 w-10 p-0 text-lg"
                    onClick={() => setIcon(iconOption)}
                  >
                    {iconOption}
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
            <Button type="submit">Update Goal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

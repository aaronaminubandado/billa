// Add Wallet Modal Component
"use client";

import React, { useState } from "react";
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

// Wallet type options
const walletTypes = [
  { value: "cash", label: "Cash", icon: "💵" },
  { value: "bank", label: "Bank Account", icon: "🏦" },
  { value: "card", label: "Credit Card", icon: "💳" },
  { value: "savings", label: "Savings", icon: "🏆" },
  { value: "mobile", label: "Mobile Wallet", icon: "📱" },
  { value: "investment", label: "Investment", icon: "📈" },
];

// NEW: Currency options
const currencies = [
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "JPY", label: "Japanese Yen (¥)" },
  { value: "CAD", label: "Canadian Dollar (C$)" },
  { value: "AUD", label: "Australian Dollar (A$)" },
  { value: "INR", label: "Indian Rupee (₹)" },
];

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAdd: (wallet: any) => void;
}

export function AddWalletModal({
  isOpen,
  onClose,
  onAdd,
}: AddWalletModalProps) {
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [type, setType] = useState("bank");
  const [currency, setCurrency] = useState("USD");
  const isMobile = useMediaQuery("(max-width: 768px)");

  // NEW: Get icon for selected wallet type
  const getIconForType = (type: string) => {
    return walletTypes.find((t) => t.value === type)?.icon || "💰";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // NEW: Validate form
    if (!name.trim()) {
      // TODO: Add proper form validation and error messages
      alert("Please enter a wallet name");
      return;
    }

    // NEW: Create new wallet object
    const newWallet = {
      name,
      balance: parseFloat(balance) || 0,
      type,
      currency,
      icon: getIconForType(type),
    };

    onAdd(newWallet);

    // Reset form
    setName("");
    setBalance("");
    setType("bank");
    setCurrency("USD");
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
          <DialogTitle>Add Wallet</DialogTitle>
          <DialogDescription>
            Create a new wallet or account to track your finances
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Wallet Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Cash Wallet, Main Bank Account"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Wallet Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {walletTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        <span className="mr-2">{type.icon}</span>
                        <span>{type.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="balance">Initial Balance</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for zero balance
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Wallet</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

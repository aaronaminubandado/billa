//  Wallets/Accounts management page
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PlusIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddWalletModal } from "@/components/wallets/add-wallet-modal";
import { EditWalletModal } from "@/components/wallets/edit-wallet-modal";
import { cn } from "@/lib/utils";

//  Sample wallet data
const sampleWallets = [
  {
    id: 1,
    name: "Cash Wallet",
    balance: 1250.75,
    currency: "USD",
    type: "cash",
    icon: "💵",
    recentActivity: [
      {
        id: 1,
        description: "Grocery Shopping",
        amount: -45.5,
        date: "2023-06-15",
      },
      {
        id: 2,
        description: "ATM Withdrawal",
        amount: -200,
        date: "2023-06-10",
      },
      {
        id: 3,
        description: "Freelance Payment",
        amount: 500,
        date: "2023-06-05",
      },
    ],
  },
  {
    id: 2,
    name: "Main Bank Account",
    balance: 4320.18,
    currency: "USD",
    type: "bank",
    icon: "🏦",
    recentActivity: [
      { id: 1, description: "Salary", amount: 3000, date: "2023-06-01" },
      { id: 2, description: "Rent Payment", amount: -1200, date: "2023-06-02" },
      {
        id: 3,
        description: "Utility Bills",
        amount: -150.25,
        date: "2023-06-05",
      },
    ],
  },
  {
    id: 3,
    name: "Credit Card",
    balance: -750.5,
    currency: "USD",
    type: "card",
    icon: "💳",
    recentActivity: [
      { id: 1, description: "Restaurant", amount: -85.75, date: "2023-06-12" },
      {
        id: 2,
        description: "Online Shopping",
        amount: -120.5,
        date: "2023-06-08",
      },
      {
        id: 3,
        description: "Subscription",
        amount: -15.99,
        date: "2023-06-01",
      },
    ],
  },
  {
    id: 4,
    name: "Savings Account",
    balance: 10500,
    currency: "USD",
    type: "savings",
    icon: "🏆",
    recentActivity: [
      {
        id: 1,
        description: "Transfer from Main Account",
        amount: 500,
        date: "2023-06-15",
      },
      { id: 2, description: "Interest", amount: 25.75, date: "2023-06-01" },
    ],
  },
  {
    id: 5,
    name: "Mobile Wallet",
    balance: 175.25,
    currency: "USD",
    type: "mobile",
    icon: "📱",
    recentActivity: [
      { id: 1, description: "Coffee Shop", amount: -4.5, date: "2023-06-15" },
      { id: 2, description: "Transport", amount: -2.75, date: "2023-06-14" },
      { id: 3, description: "Top-up", amount: 50, date: "2023-06-10" },
    ],
  },
];

interface WalletActivity {
  id: number;
  description: string;
  amount: number;
  date: string;
}

interface Wallet {
  id: number;
  name: string;
  balance: number;
  currency: string;
  type: string;
  icon: string;
  recentActivity: WalletActivity[];
}

//  Helper function to format currency
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export default function WalletsPage() {
  const [wallets, setWallets] = useState(sampleWallets);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);

  //  Calculate total balance across all wallets
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  //  Handle wallet deletion
  const handleDeleteWallet = (id: number) => {
    // TODO: Implement actual deletion with Supabase
    setWallets(wallets.filter((wallet) => wallet.id !== id));
  };

  //  Handle edit button click
  const handleEditClick = (wallet: Wallet) => {
    setCurrentWallet(wallet);
    setIsEditModalOpen(true);
  };

  //  Handle wallet update
  const handleUpdateWallet = (updatedWallet: Wallet) => {
    // TODO: Implement actual update with Supabase
    setWallets(
      wallets.map((wallet) =>
        wallet.id === updatedWallet.id ? updatedWallet : wallet
      )
    );
    setIsEditModalOpen(false);
  };

  //  Handle adding a new wallet
  const handleAddWallet = (newWallet: Wallet) => {
    // TODO: Implement actual creation with Supabase
    const id = Math.max(...wallets.map((w) => w.id)) + 1;
    setWallets([
      ...wallets,
      {
        ...newWallet,
        id,
        recentActivity: [],
      },
    ]);
    setIsAddModalOpen(false);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Wallets & Accounts</h1>
        <p className="text-muted-foreground">Manage your financial accounts</p>
      </div>

      {/*  Total balance card */}
      <Card className="mb-8 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-green-700 dark:text-green-300">
            Total Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-700 dark:text-green-300">
            {formatCurrency(totalBalance, "USD")}
          </div>
          <p className="text-sm text-green-600/80 dark:text-green-400/80 mt-1">
            Across {wallets.length} accounts
          </p>
        </CardContent>
      </Card>

      {/*  Action button */}
      <div className="flex justify-end mb-6">
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Wallet
        </Button>
      </div>

      {/*  Wallets grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((wallet) => (
          <Card key={wallet.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{wallet.icon}</span>
                  <div>
                    <CardTitle>{wallet.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">
                      {wallet.type.charAt(0).toUpperCase() +
                        wallet.type.slice(1)}
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
                    <DropdownMenuItem onClick={() => handleEditClick(wallet)}>
                      <PencilIcon className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteWallet(wallet.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <TrashIcon className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "text-2xl font-bold",
                  wallet.balance >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                )}
              >
                {formatCurrency(wallet.balance, wallet.currency)}
              </div>
            </CardContent>
            <div className="px-6 py-3 bg-muted/50">
              <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
              <div className="space-y-2">
                {wallet.recentActivity.length > 0 ? (
                  wallet.recentActivity.slice(0, 3).map((activity) => (
                    <div
                      key={activity.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <div className="truncate max-w-[70%]">
                        {activity.description}
                      </div>
                      <div className="flex items-center">
                        {activity.amount > 0 ? (
                          <TrendingUpIcon className="h-3 w-3 text-green-500 mr-1" />
                        ) : (
                          <TrendingDownIcon className="h-3 w-3 text-red-500 mr-1" />
                        )}
                        <span
                          className={
                            activity.amount > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {activity.amount > 0 ? "+" : ""}
                          {formatCurrency(activity.amount, wallet.currency)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No recent activity
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/*  Add Wallet Modal */}
      <AddWalletModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddWallet}
      />

      {/*  Edit Wallet Modal */}
      {currentWallet && (
        <EditWalletModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          wallet={currentWallet}
          onUpdate={handleUpdateWallet}
        />
      )}
    </div>
  );
}

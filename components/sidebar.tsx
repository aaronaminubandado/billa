// Enhanced sidebar with responsive behavior, collapsible functionality, and mobile bottom navigation
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  BarChartIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  PiggyBankIcon,
  LineChartIcon,
  SettingsIcon,
  MenuIcon,
  HomeIcon,
  WalletIcon,
  ReceiptIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  // Added media query hook to detect mobile viewports
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Main navigation items
  const navItems = [
    { href: "/dashboard", icon: HomeIcon, label: "Dashboard" },
    { href: "/transactions", icon: ReceiptIcon, label: "Transactions" }, // Combined expenses/income into transactions
    { href: "/wallets", icon: WalletIcon, label: "Wallets" },
    { href: "/budgeting", icon: PiggyBankIcon, label: "Budgeting" },
    { href: "/reports", icon: LineChartIcon, label: "Reports" },
    { href: "/settings", icon: SettingsIcon, label: "Settings" },
  ];

  // For mobile, limit to 5 most important items
  const mobileNavItems = navItems.slice(0, 5);

  // Render bottom navigation for mobile
  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t flex justify-around items-center h-16 px-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              href={item.href}
              key={item.href}
              className="flex flex-col items-center justify-center w-full h-full"
            >
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full h-full flex flex-col items-center justify-center rounded-none px-0",
                  isActive
                    ? "text-green-600 dark:text-green-400"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>
    );
  }

  // Desktop sidebar with collapsible functionality
  return (
    <aside
      className={cn(
        "border-r bg-card transition-all duration-300 ease-in-out h-screen sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
      </div>
      <nav className="p-2 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link href={item.href} key={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  isActive
                    ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                    : "",
                  // Adjust padding and alignment when collapsed
                  collapsed ? "px-2 justify-center" : ""
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={cn("h-5 w-5", !collapsed && "mr-2")} />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
